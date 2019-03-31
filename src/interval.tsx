import * as _ from 'lodash';
import * as rekall from 'rekall';

import {DrawType, DrawType_Bbox, DrawType_Caption} from './drawable';
import {Metadata, Metadata_Flag, Metadata_Categorical} from './metadata';
import {Database, DbVideo} from './database';

export interface VData {
  draw_type: DrawType,
  metadata: {[key: string]: Metadata}
}

export class Interval extends rekall.Interval<VData> {}
export class IntervalSet extends rekall.IntervalSet<VData> {}
export {Bounds, BoundingBox, Domain, Domain_Video} from 'rekall';

/*
 *
 * import {DrawType, DrawType_Bbox, DrawType_Caption} from './drawable';
 * import {Metadata, Metadata_Flag, Metadata_Categorical} from './metadata';
 * import {Database, DbVideo} from './database';
 *
 * export abstract class Domain {}
 *
 * export class Domain_Video extends Domain {
 *   video_id: number;
 *
 *   constructor(video_id: number) {
 *     super();
 *     this.video_id = video_id;
 *   }
 * }
 *
 * export class BoundingBox {
 *   x1: number;
 *   x2: number;
 *   y1: number;
 *   y2: number;
 *
 *   constructor(x1?: number, x2?: number, y1?: number, y2?: number) {
 *     this.x1 = x1 ? x1 : 0;
 *     this.x2 = x2 ? x2 : 1;
 *     this.y1 = y1 ? y1 : 0;
 *     this.y2 = y2 ? y2 : 1;
 *   }
 * }
 *
 * export class Bounds {
 *   domain?: Domain;
 *   t1: number;
 *   t2: number;
 *   bbox: BoundingBox;
 *
 *   constructor(t1: number, t2?: number, bbox?: BoundingBox, domain?: Domain) {
 *     this.t1 = t1;
 *     this.t2 = t2 ? t2 : t1;
 *     this.bbox = bbox ? bbox : new BoundingBox();
 *     this.domain = domain;
 *   }
 *
 *   time_overlaps(other: Bounds): boolean {
 *     return this.t1 <= other.t2 && this.t2 >= other.t1;
 *   }
 * }
 *
 * export class Interval {
 *   bounds: Bounds;
 *   draw_type: DrawType;
 *   metadata: {[key: string]: Metadata};
 *
 *   constructor(bounds: Bounds, draw_type?: DrawType, metadata?: {[key: string]: any}) {
 *     this.bounds = bounds;
 *     this.draw_type = draw_type ? draw_type : new DrawType_Bbox();
 *     this.metadata = metadata ? metadata : {};
 *   }
 * }
 *
 * export class IntervalSet {
 *   private intervals: Interval[];
 *   dirty: boolean
 *
 *   constructor(intervals: Interval[]) {
 *     this.intervals = intervals;
 *     this.dirty = false;
 *   }
 *
 *   time_overlaps(bounds: Bounds): IntervalSet {
 *     return new IntervalSet(this.intervals.filter((i) => i.bounds.time_overlaps(bounds)));
 *   }
 *
 *   union(other: IntervalSet): IntervalSet {
 *     return new IntervalSet(this.intervals.concat(other.intervals));
 *   }
 *
 *   to_list(): Interval[] {
 *     return this.intervals;
 *   }
 *
 *   static from_json(intervals: any, video_id: number, database: Database, is_captions: boolean): IntervalSet {
 *     let video = database.tables.videos.lookup<DbVideo>(video_id);
 *     return new IntervalSet(intervals.map((intvl: any) => {
 *       let t1, t2;
 *       if (is_captions) {
 *         t1 = intvl.t[0];
 *         t2 = intvl.t[1];
 *       } else {
 *         t1 = intvl.t[0] / video.fps;
 *         t2 = intvl.t[1] / video.fps;
 *       }
 *
 *       let payload = intvl.payload || {};
 *       let draw_type =
 *         is_captions
 *         ? new DrawType_Caption(payload.draw_type)
 *         : new DrawType_Bbox();
 *
 *       let metadata = _.mapValues((payload.metadata || {}), (v) => {
 *         if (v.type == 'flag') {
 *           return new Metadata_Flag();
 *         } else if (v.type == 'categorical') {
 *           return Metadata_Categorical.from_json(v);
 *         } else {
 *           throw Error("Not yet implemented");
 *         }
 *       });
 *
 *       return new Interval(
 *         new Bounds(
 *           t1, t2,
 *           new BoundingBox(intvl.x[0], intvl.x[1], intvl.y[0], intvl.y[1]),
 *           new Domain_Video(video_id)),
 *         draw_type,
 *         metadata);
 *     }));
 *   }
 * }*/
