import * as React from 'react';
import {inject} from 'mobx-react';

import {SpatialType, DrawProps, LabelProps} from './spatial_type';
import {mouse_key_events} from '../events';
import {Interval, Bounds, BoundingBox} from '../interval';
import TimeState from '../time_state';
import {ActionStack} from '../undo';
import {Metadata_Bbox} from '../metadata';

class BboxDrawView extends React.Component<DrawProps, {}> {
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

    let bbox_text: string[] = Object.values(
      this.props.interval.data.metadata
    ).filter(m => m instanceof Metadata_Bbox).map(
      m => (m as Metadata_Bbox).text
    );
    let meta_style = {
      backgroundColor: this.props.color
    };

    return <div className='bbox-draw' style={position}>
      <div className='box-outline' style={box_style} />
      {this.props.expand ?
        bbox_text.map(text => {
          return <div className='text-label' style={meta_style}>{text}</div>
        }) : null}
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
      new Bounds(t, t, new BoundingBox(start.x, end.x, start.y, end.y)),
      {spatial_type: new SpatialType_Bbox(), metadata: {}});
  }

  onMouseUp = (x: number, y: number) => {
    if (this.state.mousedown_point) {
      let label_state = this.props.label_state!;
      let interval = this.make_interval();

      this.props.action_stack!.push({
        name: "add bbox",
        do_: () => { label_state.new_intervals.add(interval); },
        undo: () => { label_state.new_intervals.remove(interval); }
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
               color={this.props.color} expand={this.props.expand} />;
    }

    let style = {width: this.props.width, height: this.props.height};

    return <div className='bbox-label' style={style}>
      {bbox}
    </div>;
  }
}

export class SpatialType_Bbox extends SpatialType {
  draw_view(): React.ComponentType<DrawProps> { return BboxDrawView; }
  label_view(): React.ComponentType<LabelProps> { return BboxLabelView; }
  static from_json(obj: any): SpatialType_Bbox { return new SpatialType_Bbox(); }
}
