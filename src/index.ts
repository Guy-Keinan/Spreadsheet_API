import express, { Request, Response } from 'express';
import { SheetService } from './services/sheet.service.js';

const app = express();
app.use(express.json());

const sheetService = new SheetService();

//Create sheet
app.post('/sheet', async (req: Request, res: Response) => {
    try {
        const { columns } = req.body;
        if (!columns || !Array.isArray(columns)) {
            res.status(400).json({ error: 'Missing or invalid columns. Columns must be an array.' });
        }

        const sheetId = await sheetService.createSheet(columns);
        res.status(201).json({ sheetId });
    } catch (error) {
        console.error('Error in POST /sheet:', error);
        res.status(500).json({ error: 'Failed to create sheet.' });
    }
});

//Get sheet by ID
app.get('/sheet/:sheetId', async (req: Request, res: Response) => {
    try {
        const sheetId = req.params.sheetId;
        const sheet = await sheetService.getSheet(sheetId);

        if (!sheet) {
            res.status(404).json({ error: 'Sheet not found.' });
        }

        res.status(200).json(sheet);
    } catch (error) {
        console.error(`Error in GET /sheet/${req.params.sheetId}:`, error);
        res.status(500).json({ error: 'Failed to retrieve sheet.' });
    }
});

//Set & Edit cell
app.put('/sheet/:sheetId/cell', async (req: Request, res: Response) => {
    const { column, row, value } = req.body;
    try {
        await sheetService.setCell(req.params.sheetId, column, row, value);
        res.sendStatus(204);
    } catch (error) {
        res.status(400).send(error);
    }
});

//Get all sheets
app.get('/sheets', async (req: Request, res: Response) => {
    try {
        const sheets = await sheetService.getAllSheets();
        res.status(200).json(sheets);
    } catch (error) {
        console.error('Error in GET /sheets:', error);
        res.status(500).json({ error: 'Failed to retrieve all sheets.' });
    }
});

export default app;

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
