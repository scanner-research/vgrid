import * as _ from 'lodash';

export interface Row {
  id: number
}

export interface DbVideo extends Row {
  path: string
  fps: number
  width: number
  height: number
  num_frames: number
}

export interface DbCategory extends Row {
  color: string
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
      throw new Error(`Error: table does not contain id ${id}`);
    }

    return this.rows[id] as T;
  }
}

/**
 * The database contains metadata about objects referenced in intervals such as videos and
 * categories. Its structure is essentially that of a SQL database, i.e. a list of tables where
 * each table is a list of rows with IDs.
 */
export class Database {
  private tables: {[table: string]: Table}

  constructor(tables: Table[]) {
    this.tables = {};
    tables.forEach((table) => { this.tables[table.name] = table });
  }

  table = (name: string): Table => {
    if (!(name in this.tables)) {
      throw new Error(`Error: database does not contain table ${name}`);
    }
    return this.tables[name];
  }

  static from_json(obj: any): Database {
    return new Database(_.keys(obj).map((k) => new Table(k, obj[k])));
  }
}
