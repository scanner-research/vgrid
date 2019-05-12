import {SpatialType} from './spatial_type';

export class SpatialType_Temporal extends SpatialType {

  private static instance: SpatialType_Temporal;

  private constructor() {
    super();
  }

  draw_view(): null { return null; }
  label_view(): null { return null; }

  static get_instance() {
    if (!SpatialType_Temporal.instance) {
      SpatialType_Temporal.instance = new SpatialType_Temporal();
    }
    return SpatialType_Temporal.instance;
  }

  static from_json(args: any): SpatialType_Temporal {
    return SpatialType_Temporal.get_instance();
  }
}
