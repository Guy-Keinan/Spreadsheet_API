import request from 'supertest';
import app from '../index';

describe('Integration Tests for SheetService API', () => {
    let sheetId: string;
    let server: any;
    // Before all tests, create a sheet
    beforeAll(async () => {
        server = app.listen(3001);
        const response = await request(app)
            .post('/sheet')
            .send({
                columns: [{ name: 'A', type: 'string' }, { name: 'B', type: 'boolean' }]
            });
    
        sheetId = response.body.sheetId;
    });

    // Test creating a new sheet
    test('should create a new sheet', async () => {
        const response = await request(app)
            .post('/sheet')
            .send({
                columns: [{ name: 'A', type: 'string' }]
            });

        expect(response.status).toBe(201);
        expect(response.body.sheetId).toBeDefined();
    });

    // Test retrieving a sheet by ID
    test('should retrieve a sheet by ID', async () => {
        const response = await request(app)
            .get(`/sheet/${sheetId}`);

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(sheetId);
        expect(response.body.columns).toBeDefined();
    });

    // Test retrieving all sheets
    test('should retrieve all sheets', async () => {
        const response = await request(app)
            .get('/sheets');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
    });

    // Test setting a cell value
    test('should set a cell value', async () => {
        const response = await request(app)
            .put(`/sheet/${sheetId}/cell`)
            .send({
                column: 'A',
                row: 1,
                value: 'hello'
            });

        expect(response.status).toBe(204);
    });

    // Test setting a cell in a non-existent column
    test('should return error when setting a cell in a non-existent column', async () => {
        const response = await request(app)
            .put(`/sheet/${sheetId}/cell`)
            .send({
                column: 'C',  // Invalid column, assuming C doesn't exist
                row: 1,
                value: 'hello'
            });
    
        expect(response.status).toBe(400);
    });

    // Test setting a cell with an invalid value type
    test('should return error when setting an invalid value type', async () => {
        const response = await request(app)
            .put(`/sheet/${sheetId}/cell`)
            .send({
                column: 'A',
                row: 1,
                value: 123  // Invalid value type
            });

        expect(response.status).toBe(400);
    });

    afterAll(async () => {
        await new Promise<void>((resolve) => server.close(() => resolve()));
    });
});
