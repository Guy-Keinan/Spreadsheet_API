import { Sheet, Cell, Column } from '../models/sheet.model.js';
import { v4 as uuidv4 } from 'uuid';

export class SheetService {
    private sheets: Map<string, Sheet>;

    constructor() {
        this.sheets = new Map();
    }


    //Create the sheet and save it locally
    //columns - contains the name and type od each column
    createSheet(columns: Column[]): string {
        try {
            const id = uuidv4();
            const sheet = new Sheet(id, columns);
            this.sheets.set(id, sheet);
            return id;
        } catch (error) {
            console.error('Error creating sheet:', error);
            throw new Error('Failed to create sheet.');
        }
    }

    //Get sheet by ID
    getSheet(sheetId: string): Sheet | null {
        try {
            const sheet = this.sheets.get(sheetId);
            if (!sheet) throw new Error(`Sheet with ID "${sheetId}" not found.`);
            return sheet;
        } catch (error) {
            console.error(`Error retrieving sheet with ID ${sheetId}:`, error);
            throw new Error(`Failed to retrieve sheet with ID "${sheetId}".`);
        }
    }

    //Create new cell or edit existed one
    //value - can be 'lookup(x,y)'
    setCell(sheetId: string, columnName: string, rowIndex: number, value: any): void {
        try {
            const sheet = this.getSheet(sheetId);
            let resolvedValue;
            if (!sheet) throw new Error('Sheet not found.');

            const column = sheet.columns.find((col: any) => col.name === columnName);
            if (!column) throw new Error('Column not found.');

            const cellKey = `${columnName}:${rowIndex}`;

            //Gets to actual value of a lookup and register a dependency between the cells
            if (typeof value === 'string' && value.startsWith('lookup')) {
                resolvedValue = this.resolveLookup(value, sheet, cellKey);
                this.registerDependency(sheet, cellKey, value);
            }

            //Validate in case there isn't match between the value type nad the column type
            this.validateType(column.type, resolvedValue, value);

            sheet.cells.set(cellKey, { column: columnName, row: rowIndex, value, resolvedValue });

            //Ensuring that updates to source cells are correctly reflected in all dependent cells
            this.propagateUpdates(sheet, cellKey);
        } catch (error) {
            console.error(`Error setting cell (${columnName}, ${rowIndex}) in sheet ${sheetId}:`, error);
            throw new Error('Failed to set cell value.');
        }
    }

    getAllSheets(): Sheet[] {
        try {
            return Array.from(this.sheets.values());
        } catch (error) {
            console.error('Error retrieving all sheets:', error);
            throw new Error('Failed to retrieve all sheets.');
        }
    }

    private validateType(type: string, resolvedValue: any, value: any): void {
        let finalValue = resolvedValue || value;
        if (typeof (finalValue) !== type) {
            throw new Error(`Invalid type for cell (${type}).`);
        }
    }

    private resolveLookup(value: string, sheet: Sheet, dependentCellKey: string): any {
        try {
            const match = value.match(/lookup\((\w+),(\d+)\)/);
            if (!match) throw new Error('Invalid lookup syntax.');

            const [, columnName, rowIndex] = match;
            const sourceCellKey = `${columnName}:${rowIndex}`;
            const sourceCell = sheet.cells.get(sourceCellKey);

            if (!sourceCell) {
                throw new Error(`Source cell ${sourceCellKey} not found.`);
            }

            //End recursion 
            if (sourceCellKey === dependentCellKey) {
                throw new Error(`Circular dependency is invalid.`);
            }

            if (typeof sourceCell.value === 'string' && sourceCell.value.startsWith('lookup')) {
                const resolvedSourceValue = this.resolveLookup(sourceCell.value, sheet, dependentCellKey);
                return resolvedSourceValue;
            }

            return sourceCell.resolvedValue ?? sourceCell.value;
        } catch (error) {
            console.error(`Error resolving lookup "${value}" in sheet:`, error);
            throw new Error('Failed to resolve lookup.');
        }
    }

    private propagateUpdates(sheet: Sheet, sourceCellKey: string): void {
        const dependents = sheet.dependencies.get(sourceCellKey);
        if (dependents) {
            for (const dependentKey of dependents) {
                const dependentCell = sheet.cells.get(dependentKey);

                if (dependentCell && typeof dependentCell.value === 'string' && dependentCell.value.startsWith('lookup')) {
                    const updatedValue = this.resolveLookup(dependentCell.value, sheet, dependentKey);

                    sheet.cells.set(dependentKey, {
                        column: dependentCell.column,
                        row: dependentCell.row,
                        value: dependentCell.value,
                        resolvedValue: updatedValue
                    });

                    this.propagateUpdates(sheet, dependentKey);
                }
            }
        }
    }


    private registerDependency(sheet: Sheet, cellKey: string, formula: string): void {
        const match = formula.match(/lookup\((\w+),(\d+)\)/);
        if (match) {
            const [, sourceColumn, sourceRow] = match;
            const sourceKey = `${sourceColumn}:${sourceRow}`;

            if (!sheet.dependencies.has(sourceKey)) {
                sheet.dependencies.set(sourceKey, new Set());
            }
            sheet.dependencies.get(sourceKey)?.add(cellKey);
        }
    }
}