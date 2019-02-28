export interface Row {
  id: number
}

export interface DbVideo {
  id: number
  path: string
  fps: number
  width: number
  height: number
}

export class Table {
  rows: {[id: number]: Row}

  constructor(rows: Row[]) {
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

  constructor(tables: {[table: string]: Table}) {
    this.tables = tables;
  }
}
