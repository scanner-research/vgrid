export abstract class Metadata {}

// Simple metadata for indicating that an interval should be visually flagged. Useful for
// labeling or any kind of lightweight mark that isn't a categorical.
export class Metadata_Flag extends Metadata {}

// The most generic kind of metadata, i.e. it has no particular structure that can be
// visualized. It will show up in the metadata sidebar.
export class Metadata_Generic extends Metadata {
  data: any

  constructor(data: any) {
    super();
    this.data = data;
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
}

export class Categories {
  categories: {[category_type: number]: {[category: number]: string}}

  constructor(categories: {[category_type: number]: {[category: number]: string}}) {
    this.categories = categories;
  }

  label(category: Metadata_Categorical): string {
    return this.categories[category.category_type][category.category];
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
}
