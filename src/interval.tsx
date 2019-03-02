import {DrawType} from './drawable';
import {Metadata} from './metadata';

export abstract class Domain {}

export class Domain_Video extends Domain {
  video_id: number;

  constructor(video_id: number) {
    super();
    this.video_id = video_id;
  }
}

export class BoundingBox {
  x1: number;
  x2: number;
  y1: number;
  y2: number;

  constructor(x1?: number, x2?: number, y1?: number, y2?: number) {
    this.x1 = x1 ? x1 : 0;
    this.x2 = x2 ? x2 : 1;
    this.y1 = y1 ? y1 : 0;
    this.y2 = y2 ? y2 : 1;
  }
}

export class Bounds {
  domain?: Domain;
  t1: number;
  t2: number;
  bbox: BoundingBox;

  constructor(t1: number, t2?: number, bbox?: BoundingBox, domain?: Domain) {
    this.t1 = t1;
    this.t2 = t2 ? t2 : t1;
    this.bbox = bbox ? bbox : new BoundingBox();
    this.domain = domain;
  }

  time_overlaps(other: Bounds): boolean {
    return this.t1 <= other.t2 && this.t2 >= other.t1;
  }
}

export class Interval {
  bounds: Bounds;
  draw_type: DrawType;
  metadata: {[key: string]: Metadata};

  constructor(bounds: Bounds, draw_type: DrawType, metadata?: {[key: string]: any}) {
    this.bounds = bounds;
    this.draw_type = draw_type;
    this.metadata = metadata ? metadata : {};
  }
}

export class IntervalSet {
  private intervals: Interval[];

  constructor(intervals: Interval[]) {
    this.intervals = intervals;
  }

  time_overlaps(bounds: Bounds): IntervalSet {
    return new IntervalSet(this.intervals.filter((i) => i.bounds.time_overlaps(bounds)));
  }

  union(other: IntervalSet): IntervalSet {
    return new IntervalSet(this.intervals.concat(other.intervals));
  }

  to_list(): Interval[] {
    return this.intervals;
  }
}
