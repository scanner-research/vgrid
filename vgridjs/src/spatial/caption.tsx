import {SpatialType} from './spatial_type';

export class SpatialType_Caption extends SpatialType {
  text: string

  constructor(text: string) {
    super();
    this.text = text;
  }

  draw_view(): null { return null; }
  label_view(): null { return null; }

  static from_json(args: any): SpatialType_Caption {
    return new SpatialType_Caption(args.text);
  }
}
