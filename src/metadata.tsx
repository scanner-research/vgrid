export abstract class Metadata {}

export class Metadata_Categorical extends Metadata {
  category: number
  category_type: number

  constructor(category: number, category_type: number) {
    super();
    this.category = category;
    this.category_type = category_type;
  }
}

export class Metadata_Generic extends Metadata {
  data: any

  constructor(data: any) {
    super();
    this.data = data;
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

export class Metadata_Flag extends Metadata {}
