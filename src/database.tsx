export interface Row {
  id: number
}

export interface DbVideo {
  id: number
  path: string
  fps: number
  width: number
  height: number
  num_frames: number
}

export class Table {
  name: string
  rows: {[id: number]: Row}

  constructor(name: string, rows: Row[]) {
    this.name = name;
    this.rows = {};
    rows.forEach((row) => { this.rows[row.id] = row; });
  }

  lookup = <T extends Row>(id: number): T => {
    if (!(id in this.rows)) {
      throw Error(`Error: table does not contain id ${id}`);
    }

    return this.rows[id] as T;
  }
}

export class Database {
  tables: {[table: string]: Table}

  constructor(tables: Table[]) {
    this.tables = {};
    tables.forEach((table) => { this.tables[table.name] = table });
  }
}
