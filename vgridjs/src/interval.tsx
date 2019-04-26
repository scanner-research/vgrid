/**
 * VGrid uses Rekall intervals as the core data type with a particular kind of structured payload.
 */

import * as _ from 'lodash';
import * as rekall from '@wcrichto/rekall';

import {DrawType, drawtype_from_json} from './drawable';
import {Metadata, metadata_from_json} from './metadata';
import {Database, DbVideo} from './database';

/** Interval payload must contain a draw type and a set of keyed metadata. */
export interface VData {
  draw_type: DrawType,
  metadata: {[key: string]: Metadata}
}

export class Interval extends rekall.Interval<VData> {}
export class IntervalSet extends rekall.IntervalSet<VData> {}
export {Bounds, BoundingBox, Domain, Domain_Video} from '@wcrichto/rekall';

export let vdata_from_json = (obj: any): VData => {
  return {
    draw_type: drawtype_from_json(obj.draw_type),
    metadata: _.mapValues(obj.metadata, metadata_from_json)
  }
};