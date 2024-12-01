export interface Column {
    name: string;
    type: 'boolean' | 'int' | 'double' | 'string';
}

export interface Cell {
    column: string;
    row: number;
    value: any;
    resolvedValue?: any;
}

export class Sheet {
    id: string;
    columns: Column[];
    cells: Map<string, Cell>;
    dependencies: Map<string, Set<string>>; 

    constructor(id: string, columns: Column[]) {
        this.id = id;
        this.columns = columns;
        this.cells = new Map();
        this.dependencies = new Map();
    }

    toJSON() {
        return {
            id: this.id,
            columns: this.columns,
            cells: Object.fromEntries(this.cells)
        };
    }
}  