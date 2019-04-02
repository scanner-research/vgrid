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

export class Database {
  tables: {[table: string]: Table}
  id_to_name: {[id: number]: string}

  constructor(tables: Table[], id_to_name: {[id: number]: string}) {
    this.tables = {};
    tables.forEach((table) => { this.tables[table.name] = table });
    this.id_to_name = id_to_name;
  }

  table = (id: number): Table => {
    if (!(id in this.id_to_name)) {
      throw new Error(`Error: database does not contain table id ${id}`);
    }
    return this.tables[this.id_to_name[id]];
  }

  static from_json(obj: any): Database {
    return new Database(
      _.keys(obj.tables).map((k) => new Table(k, obj.tables[k])),
      obj.id_to_name);
  }
}
