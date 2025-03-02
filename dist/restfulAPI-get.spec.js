"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tests/restful-api.spec.ts
const test_1 = require("@playwright/test");
const BASE_URL = 'https://restful-api.dev';
test_1.test.describe('RESTful API Tests', () => {
    let createdObjectId;
    (0, test_1.test)('1. Get list of all objects', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/objects`);
        (0, test_1.expect)(response.ok()).toBeTruthy();
        const objects = await response.json();
        (0, test_1.expect)(Array.isArray(objects)).toBeTruthy();
    });
    (0, test_1.test)('2. Add an object using POST', async ({ request }) => {
        const newObject = {
            name: 'Test Object',
            data: {
                value: 'Test Value',
            },
        };
        const response = await request.post(`${BASE_URL}/objects`, { data: newObject });
        (0, test_1.expect)(response.ok()).toBeTruthy();
        const createdObject = await response.json();
        (0, test_1.expect)(createdObject.name).toBe(newObject.name);
        (0, test_1.expect)(createdObject.data.value).toBe(newObject.data.value);
        createdObjectId = createdObject.id;
        (0, test_1.expect)(createdObjectId).toBeDefined();
    });
    (0, test_1.test)('3. Get a single object using the above added ID', async ({ request }) => {
        (0, test_1.expect)(createdObjectId).toBeDefined();
        const response = await request.get(`${BASE_URL}/objects/${createdObjectId}`);
        (0, test_1.expect)(response.ok()).toBeTruthy();
        const retrievedObject = await response.json();
        (0, test_1.expect)(retrievedObject.id).toBe(createdObjectId);
        (0, test_1.expect)(retrievedObject.name).toBe('Test Object');
    });
    (0, test_1.test)('4. Update the object added in Step 2 using PUT', async ({ request }) => {
        (0, test_1.expect)(createdObjectId).toBeDefined();
        const updatedObject = {
            name: 'Updated Test Object',
            data: {
                value: 'Updated Test Value',
            },
        };
        const response = await request.put(`${BASE_URL}/objects/${createdObjectId}`, { data: updatedObject });
        (0, test_1.expect)(response.ok()).toBeTruthy();
        const updatedResponseObject = await response.json();
        (0, test_1.expect)(updatedResponseObject.id).toBe(createdObjectId);
        (0, test_1.expect)(updatedResponseObject.name).toBe(updatedObject.name);
        (0, test_1.expect)(updatedResponseObject.data.value).toBe(updatedObject.data.value);
    });
    (0, test_1.test)('5. Delete the object using DELETE', async ({ request }) => {
        (0, test_1.expect)(createdObjectId).toBeDefined();
        const response = await request.delete(`${BASE_URL}/objects/${createdObjectId}`);
        (0, test_1.expect)(response.ok()).toBeTruthy();
        const getResponse = await request.get(`${BASE_URL}/objects/${createdObjectId}`);
        (0, test_1.expect)(getResponse.status()).toBe(404);
    });
    (0, test_1.test)('6. Verify status code on invalid object id', async ({ request }) => {
        const invalidId = 'invalid-id';
        const response = await request.get(`${BASE_URL}/objects/${invalidId}`);
        (0, test_1.expect)(response.status()).toBe(404);
    });
    (0, test_1.test)('7. Verify that the list objects endpoint returns json', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/objects`);
        (0, test_1.expect)(response.headers()['content-type']).toContain('application/json');
    });
});
