export abstract class Metadata {}

// Simple metadata for indicating that an interval should be visually flagged. Useful for
// labeling or any kind of lightweight mark that isn't a categorical.
export class Metadata_Flag extends Metadata {
  static from_json(obj: any): Metadata_Flag {
    return new Metadata_Flag();
  }
}

// The most generic kind of metadata, i.e. it has no particular structure that can be
// visualized. It will show up in the metadata sidebar.
export class Metadata_Generic extends Metadata {
  data: any

  constructor(data: any) {
    super();
    this.data = data;
  }

  static from_json(obj: any): Metadata_Generic {
    return new Metadata_Generic(obj);
  }
}

// Categorical metadata, e.g. gender or shot type.
export class Metadata_Categorical extends Metadata {
  category: number
  category_type: number

  constructor(category: number, category_type: number) {
    super();
    this.category = category;
    this.category_type = category_type;
  }

  static from_json(obj: any): Metadata_Categorical {
    return new Metadata_Categorical(obj.category, obj.category_type);
  }
}

// Metadata specifically on a caption string that provides sub-string precision.
export class Metadata_CaptionMeta extends Metadata {
  meta: Metadata
  char_start: number
  char_end: number

  constructor(meta: Metadata, char_start: number, char_end: number) {
    super();
    this.meta = meta;
    this.char_start = char_start;
    this.char_end = char_end;
  }

  static from_json(obj: any): Metadata_CaptionMeta {
    throw new Error('Not yet implemented');
  }
}
