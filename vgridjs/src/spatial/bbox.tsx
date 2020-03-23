import * as React from 'react';
import {inject} from 'mobx-react';

import {SpatialType, DrawProps, LabelProps} from './spatial_type';
import {mouse_key_events} from '../events';
import {Interval, Bounds, BoundingBox} from '../interval';
import TimeState from '../time_state';
import {ActionStack} from '../undo';

class BboxDrawView extends React.Component<DrawProps, {}> {
  render() {
    let bbox = this.props.interval.bounds.bbox;
    let color = this.props.color;

    let bbox_args = (this.props.interval.data.spatial_type as SpatialType_Bbox).args;
    var opacity = 1;

    if (bbox_args.fade) {
      let bounds = this.props.interval.bounds;
      var duration = bounds.t2 - bounds.t1;
      var amount;
      if (typeof(bbox_args.fade) == 'number') {
        amount = bbox_args.fade;
      } else {
        amount = bbox_args.fade.amount ? bbox_args.fade.amount : 1.;
        if (bbox_args.fade.duration) {
          duration = bbox_args.fade.duration;
        }
      }
      opacity -= amount * Math.min(this.props.time - bounds.t1, duration) / duration;
    }
    if (bbox_args.color) {
      color = bbox_args.color;
    }

    let position = {
      left: bbox.x1 * this.props.width,
      top: bbox.y1 * this.props.height
    };
    let box_style = {
      width: (bbox.x2 - bbox.x1) * this.props.width,
      height: (bbox.y2 - bbox.y1) * this.props.height,
      border: `2px solid ${color}`,
      opacity: opacity
    };

    var bbox_text = bbox_args.text ? bbox_args.text : null;
    if (!this.props.expand && bbox_text) {
      bbox_text = (bbox_text as string).split(' ').filter(t => t.length > 0).map(t => t[0].toUpperCase()).join('');
    }
    let bbox_text_style = {
      backgroundColor: this.props.color, opacity: opacity,
      fontSize: this.props.expand ? 'medium' : 'small'
    };

    return <div className='bbox-draw' style={position}>
      <div className='box-outline' style={box_style} />
      {bbox_text ?
        <div className='text-label' style={bbox_text_style}>{bbox_text}</div>
        : null}
    </div>;
  }
}

interface Point {
  x: number
  y: number
}

interface BboxLabelState {
  shift_held: boolean
  mousedown_point: Point | null
  mousemove_point: Point | null
}

interface BboxLabelProps {
  time_state?: TimeState
  action_stack?: ActionStack
}

@inject("time_state", "label_state", "action_stack")
@mouse_key_events
class BboxLabelView extends React.Component<LabelProps & BboxLabelProps, BboxLabelState> {
  // Note: explicit type annotation on state is required to avoid coercion of union types with
  // initial null values
  // https://stackoverflow.com/questions/51201315/why-does-null-react-component-state-initialization-get-never-type
  state: BboxLabelState = {
    shift_held: false,
    mousedown_point: null,
    mousemove_point: null
  }

  onKeyDown = (key: string) => {
    if (key == "Shift") {
      this.setState({shift_held: true});
    }
  }

  onKeyUp = (key: string) => {
    if (key == "Shift") {
      this.setState({shift_held: false});
    }
  }

  onMouseLeave = () => {
    this.reset_state();
  }

  onMouseDown = (x: number, y: number) => {
    if (this.state.shift_held) {
      let p = {x: x / this.props.width, y: y / this.props.height};
      this.setState({
        mousedown_point: p,
        mousemove_point: p
      });
    }
  }

  onMouseMove = (x: number, y: number) => {
    if (this.state.mousedown_point) {
      this.setState({
        mousemove_point: {x: x / this.props.width, y: y / this.props.height}
      });
    }
  }

  reset_state = () => {
    this.setState({
      shift_held: false,
      mousedown_point: null,
      mousemove_point: null
    });
  }

  make_interval = () => {
    let t = this.props.time_state!.time;
    let start = this.state.mousedown_point!;
    let end = this.state.mousemove_point!;
    return new Interval(
      new Bounds(t, t + 1, new BoundingBox(start.x, end.x, start.y, end.y)),
      {spatial_type: new SpatialType_Bbox({fade: 0.5}), metadata: {}});
  }

  onMouseUp = (x: number, y: number) => {
    if (this.state.mousedown_point) {
      let label_state = this.props.label_state!;
      let interval = this.make_interval();

      this.props.action_stack!.push({
        name: "add bbox",
        do_: () => { label_state.new_positive_intervals.add(interval); },
        undo: () => { label_state.new_positive_intervals.remove(interval); }
      });

      this.reset_state();
    }
  }

  render() {
    let bbox = null;
    if (this.state.mousedown_point) {
      bbox = <BboxDrawView
               interval={this.make_interval()}
               width={this.props.width} height={this.props.height}
               color={this.props.color} expand={this.props.expand}
               time={this.props.time} />;
    }

    let style = {width: this.props.width, height: this.props.height};

    return <div className='bbox-label' style={style}>
      {bbox}
    </div>;
  }
}

export class SpatialType_Bbox extends SpatialType {

  args: any

  constructor(args?: any) {
    super();
    this.args = args ? args : {};
  }

  draw_view(): React.ComponentType<DrawProps> { return BboxDrawView; }
  label_view(): React.ComponentType<LabelProps> { return BboxLabelView; }
  static from_json(obj: any): SpatialType_Bbox {
    return new SpatialType_Bbox(obj);
  }
}
