import {SpatialType} from './spatial_type';

export class SpatialType_Caption extends SpatialType {
  text: string
  style: any

  constructor(text: string, style: any) {
    super();
    this.text = text;
    this.style = style ? style : {};
  }

  draw_view(): null { return null; }
  label_view(): null { return null; }

  static from_json(args: any): SpatialType_Caption {
    return new SpatialType_Caption(args.text, args.style);
  }
}
