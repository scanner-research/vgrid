/**
 * VGrid uses Rekall intervals as the core data type with a particular kind of structured payload.
 */

import * as _ from 'lodash';
import * as rekall from '@wcrichto/rekall';

import {SpatialType, spatial_type_from_json} from './spatial/mod';
import {Metadata, metadata_from_json} from './metadata';
import {Database, DbVideo} from './database';

/** Interval payload must contain a draw type and a set of keyed metadata. */
export interface VData {
  spatial_type: SpatialType,
  metadata: {[key: string]: Metadata}
}

export class Interval extends rekall.Interval<VData> {}
export class IntervalSet extends rekall.IntervalSet<VData> {}
export {Bounds, BoundingBox, Domain, Domain_Video} from '@wcrichto/rekall';

export let vdata_from_json = (obj: any): VData => {
  return {
    spatial_type: spatial_type_from_json(obj.spatial_type),
    metadata: _.mapValues(obj.metadata, metadata_from_json)
  }
};
