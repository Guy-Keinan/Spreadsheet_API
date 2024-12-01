import { SheetService } from '../services/sheet.service';

describe('SheetService', () => {
    let sheetService: SheetService;

    beforeEach(() => {
        sheetService = new SheetService();
    });

    describe('getSheet', () => {
        test('should retrieve an existing sheet by ID', () => {
            // Create a sheet
            const sheetId = sheetService.createSheet([{ name: 'A', type: 'string' }]);

            // Get the sheet
            const sheet = sheetService.getSheet(sheetId);

            // Assert the sheet exists and matches expectations
            expect(sheet).toBeDefined();
            expect(sheet?.id).toBe(sheetId);
            expect(sheet?.columns).toHaveLength(1);
            expect(sheet?.columns[0].name).toBe('A');
            expect(sheet?.columns[0].type).toBe('string');
        });

        test('should throw an error when retrieving a non-existent sheet', async () => {
            expect(async () => {
                await sheetService.getSheet('non-existent-id');
            }).rejects.toThrow();
        });
    });

    describe('setCell', () => {
        test('should set a cell value correctly', () => {
            // Create a sheet
            const sheetId = sheetService.createSheet([{ name: 'A', type: 'string' }]);

            // Set a cell value
            sheetService.setCell(sheetId, 'A', 1, 'hello');

            // Get the sheet to check the cell
            const sheet = sheetService.getSheet(sheetId);

            const cellKey = 'A:1';
            const cell = sheet?.cells.get(cellKey);

            // Assert the cell exists and has the correct value
            expect(cell).toBeDefined();
            expect(cell?.value).toBe('hello');
        });

        test('should throw an error when setting a cell in a non-existent column', async () => {
            // Create a sheet
            const sheetId = sheetService.createSheet([{ name: 'A', type: 'string' }]);

            // Set a cell in a non-existent column
            expect(async () => {
                await sheetService.setCell(sheetId, 'B', 1, 'hello');
            }).rejects.toThrow();
        });

        test('should throw an error when setting an invalid value type', () => {
            // Create a sheet
            const sheetId = sheetService.createSheet([{ name: 'A', type: 'string' }]);

            // Set a cell with an invalid value type
            expect(async () => {
                await sheetService.setCell(sheetId, 'A', 1, 123);
            }).rejects.toThrow();
        });

        test('should set a lookup formula and resolve its value', () => {
            // Create a sheet
            const sheetId = sheetService.createSheet([
                { name: 'A', type: 'string' },
                { name: 'C', type: 'string' },
            ]);

            // Set root cell value
            sheetService.setCell(sheetId, 'A', 1, 'hello');

            // Set lookup cell value
            sheetService.setCell(sheetId, 'C', 1, 'lookup(A,1)');

            // Get the sheet to check the lookup cell
            const sheet = sheetService.getSheet(sheetId);

            const cellKey = 'C:1';
            const cell = sheet?.cells.get(cellKey);

            // Assert the lookup cell exists and has the correct resolved value
            expect(cell).toBeDefined();
            expect(cell?.resolvedValue).toBe('hello');
        });
    });

    describe('getAllSheets', () => {
        test('should return all sheets', () => {
            // Create sheets
            const sheet1Id = sheetService.createSheet([{ name: 'A', type: 'string' }]);
            const sheet2Id = sheetService.createSheet([{ name: 'B', type: 'boolean' }]);

            // Get all sheets
            const allSheets = sheetService.getAllSheets();

            // Check if the number of sheets is correct
            expect(allSheets).toHaveLength(2);

            // Check if the sheets created exist in the result
            const sheetIds = allSheets.map(sheet => sheet.id);
            expect(sheetIds).toContain(sheet1Id);
            expect(sheetIds).toContain(sheet2Id);
        });
    })
});
