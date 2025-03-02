import { test, expect } from '@playwright/test';

const BASE_URL = 'https://api.restful-api.dev';

interface ObjectData {
  name: string;
  data: {
    year: number;
    price: number;
    'CPU model': string;
    'Hard disk size': string;
  };
}

test.describe('restful-api.dev API Tests', () => {
  test.describe.configure({ mode: 'serial' }); // Run tests sequentially

  let createdObjectId: string;

  test('1. Get list of all objects', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/objects`);
    console.log(`Response Status: ${response.status()}`);

    const responseText = await response.text(); // Get the response text

    try {
      const responseBody = JSON.parse(responseText); // Try to parse as JSON
      console.log('Response Body (JSON):', responseBody);
    } catch (error) {
      console.log('Response Body (Text):', responseText); // If parsing fails, log as text
      console.error('Error parsing JSON:', error);
    }

    expect(response.ok()).toBeTruthy();
    const objects = await response.json();
    expect(Array.isArray(objects)).toBeTruthy();
  });

  test('2. Add an object using POST', async ({ request }) => {
    const newObject: ObjectData = {
      name: 'Laptop',
      data: {
        year: 2023,
        price: 1200,
        'CPU model': 'Intel i7',
        'Hard disk size': '1 TB',
      },
    };

    const response = await request.post(`${BASE_URL}/objects`, { data: newObject });

    try {
      const createdObject = await response.json(); // Try parsing the response as JSON

      if (!response.ok()) {
        console.error(`POST request failed with status: ${response.status()}`);
        console.error('Response body:', createdObject); // Log the parsed JSON error response
        expect(response.ok()).toBeTruthy(); // Fail the test if POST fails
      } else {
        console.log('Created object:', createdObject); // Log the parsed JSON created object
        expect(createdObject.name).toBe(newObject.name);
        expect(createdObject.data).toEqual(newObject.data);
        expect(createdObject.id).toBeDefined();
        createdObjectId = createdObject.id;
      }

    } catch (error) {
      console.error('Error parsing JSON:', error);
      console.error('Raw response text:', await response.text()); // Log raw response for debugging
      expect(response.ok()).toBeTruthy(); // Fail the test if parsing fails
    }
  });

  test('3. Get a single object using the above added ID', async ({ request }) => {
    expect(createdObjectId).toBeDefined();

    const response = await request.get(`${BASE_URL}/objects/${createdObjectId}`);

    try {
      const retrievedObject = await response.json(); // Try parsing the response as JSON

      if (!response.ok()) {
        console.error(`GET request failed with status: ${response.status()}`);
        console.error('Response body:', retrievedObject); // Log the parsed JSON error response
        expect(response.ok()).toBeTruthy(); // Fail the test if GET fails
      } else {
        console.log('Retrieved object:', retrievedObject); // Log the parsed JSON retrieved object
        expect(retrievedObject).toBeDefined();
        expect(retrievedObject.id).toBe(createdObjectId);
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
      console.error('Raw response text:', await response.text()); // Log raw response for debugging
      expect(response.ok()).toBeTruthy(); // Fail the test if parsing fails
    }
  });

  test('4. Update the object added in Step 2 using PUT', async ({ request }) => {
    expect(createdObjectId).toBeDefined();
    const updatedObject: ObjectData = {
      name: 'Updated Laptop',
      data: {
        year: 2024,
        price: 1300,
        'CPU model': 'Intel i9',
        'Hard disk size': '2 TB',
      },
    };

    const response = await request.put(`${BASE_URL}/objects/${createdObjectId}`, { data: updatedObject });
    expect(response.ok()).toBeTruthy();
    const updatedResponseObject = await response.json();
    expect(updatedResponseObject.name).toBe(updatedObject.name);
    expect(updatedResponseObject.data).toEqual(updatedObject.data);
  });

  test('5. Delete the object using DELETE', async ({ request }) => {
    expect(createdObjectId).toBeDefined();
    const response = await request.delete(`${BASE_URL}/objects/${createdObjectId}`);
    expect(response.ok()).toBeTruthy();

    const getResponse = await request.get(`${BASE_URL}/objects/${createdObjectId}`);
    expect(getResponse.status()).toBe(404);
  });

  test('6. Verify content type is json', async ({request}) => {
    const response = await request.get(`${BASE_URL}/objects`);
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('7. Verify 404 on invalid ID', async ({request}) => {
    const invalidId = 'invalid_id';
    const response = await request.get(`${BASE_URL}/objects/${invalidId}`);
    expect(response.status()).toBe(404);
  });
});