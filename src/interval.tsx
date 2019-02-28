abstract class DrawType {}

export class DrawType_Bbox extends DrawType {}

export class DrawType_Keypoints extends DrawType {}

export class DrawType_Caption extends DrawType {}

abstract class Domain {}

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
  domain: Domain;
  t1: number;
  t2: number;
  bbox: BoundingBox;

  constructor(domain: Domain, t1: number, t2?: number, bbox?: BoundingBox) {
    this.domain = domain;
    this.t1 = t1;
    this.t2 = t2 ? t2 : t1;
    this.bbox = bbox ? bbox : new BoundingBox();
  }
}

export class Interval {
  bounds: Bounds;
  draw_type: DrawType;
  metadata: {[key: string]: any};

  constructor(bounds: Bounds, draw_type: DrawType, metadata: {[key: string]: any}) {
    this.bounds = bounds;
    this.draw_type = draw_type;
    this.metadata = metadata;
  }
}

export class IntervalSet {
  intervals: Interval[];

  constructor(intervals: Interval[]) {
    this.intervals = intervals;
  }
}
