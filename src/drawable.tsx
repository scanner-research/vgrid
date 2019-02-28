import * as React from "react";
import {Interval} from './interval';

export interface Drawable {
  interval: Interval,
  width: number,
  height: number,
  color: string
}

class BoundingBoxView extends React.Component<Drawable, {}> {
  render() {
    let bbox = this.props.interval.bounds.bbox;
    let position = {
      left: bbox.x1 * this.props.width,
      top: bbox.y1 * this.props.height
    };
    let box_style = {
      width: (bbox.x2 - bbox.x1) * this.props.width,
      height: (bbox.y2 - bbox.y1) * this.props.height,
      border: `2px solid ${this.props.color}`
    };
    return <div className='bounding-box' style={position}>
      <div className='box-outline' style={box_style} />
    </div>;
  }
}

export abstract class DrawType {
  abstract view(): React.ComponentType<Drawable> | null;
}

export class DrawType_Bbox extends DrawType {
  view(): React.ComponentType<Drawable> { return BoundingBoxView; }
}

export class DrawType_Keypoints extends DrawType {
  view(): null { return null; }
}

export class DrawType_Caption extends DrawType {
  view(): null { return null; }
}
