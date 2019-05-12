import {SpatialType} from './spatial_type';

export class SpatialType_Temporal extends SpatialType {

  draw_view(): null { return null; }
  label_view(): null { return null; }

  static from_json(args: any): SpatialType_Temporal {
    return new SpatialType_Temporal();
  }
}
