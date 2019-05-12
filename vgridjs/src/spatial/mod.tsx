import {SpatialType_Bbox} from './bbox';
import {SpatialType_Keypoints} from './keypoints';
import {SpatialType_Caption} from './caption';
import {SpatialType_Temporal} from './temporal';
import {SpatialType} from './spatial_type';

export * from './spatial_type';
export * from './bbox';
export * from './caption';
export * from './keypoints';
export * from './temporal';

export let spatial_type_from_json = (obj: any): SpatialType => {
  let types: any = {
    'SpatialType_Bbox': SpatialType_Bbox,
    'SpatialType_Keypoints': SpatialType_Keypoints,
    'SpatialType_Caption': SpatialType_Caption,
    'SpatialType_Temporal': SpatialType_Temporal
  };

  if (!(obj.type in types)) {
    throw `Invalid spatial type ${obj.type}`;
  }

  return types[obj.type].from_json(obj.args);
};
