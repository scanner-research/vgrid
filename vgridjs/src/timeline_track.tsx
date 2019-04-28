import * as React from "react";
import * as _ from 'lodash';
import {observable, computed, action} from 'mobx';
import {observer, inject} from 'mobx-react';

import {SpatialType_Bbox} from './spatial/bbox';
import {IntervalSet, Interval, Bounds} from './interval';
import TimeState from './time_state';
import {DbVideo} from './database';
import {default_palette} from './color';
import {mouse_key_events} from './events';
import {key_dispatch, KeyMode} from './keyboard';
import {Settings} from './settings';
import {BlockLabelState} from './label_state';

let Constants = {
  /** How tall the timeline is when block is vs. isn't expanded */
  timeline_unexpanded_height: 50,
  timeline_expanded_height: 100,

  /** Height in pixels of ticks marking time beneath timeline */
  tick_height: 20,

  /** Number of ticks (evenly spaced) */
  num_ticks: 10
}

interface TimelineRowProps {
  intervals: IntervalSet,
  row_height: number
  full_width: number
  full_duration: number
  color: string
}

// https://stackoverflow.com/questions/22266826/how-can-i-do-a-shallow-comparison-of-the-properties-of-two-objects-with-javascri
let shallowCompare = (obj1: any, obj2: any): boolean =>
  Object.keys(obj1).length === Object.keys(obj2).length &&
  Object.keys(obj1).every(key =>
    obj2.hasOwnProperty(key) && obj1[key] === obj2[key]
  );

function time_to_x(t: number, bounds: TimelineBounds, width: number): number {
  return (t - bounds.start) / bounds.span() * width;
}

function x_to_time(x: number, bounds: TimelineBounds, width: number): number {
  return x / width * bounds.span() + bounds.start;
}

// Single row of the timeline corresponding to one interval set
class TimelineRow extends React.Component<TimelineRowProps, {}> {
  private canvas_ref : React.RefObject<HTMLCanvasElement>;

  constructor(props : TimelineRowProps) {
    super(props);
    this.canvas_ref = React.createRef();
  }

  /*
   *   shouldComponentUpdate(next_props: TimelineRowProps, next_state: {}) {
   *     return !shallowCompare(this.props, next_props) || this.props.intervals.dirty;
   *   }
   *  */

  render_canvas() {
    const canvas = this.canvas_ref.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = this.props.color;
        this.props.intervals.to_list().map((intvl, i) => {
          let bounds = intvl.bounds;
          let x = bounds.t1 / this.props.full_duration * this.props.full_width;
          let width = Math.min(
            (bounds.t2 - bounds.t1) / this.props.full_duration * this.props.full_width,
            1);
          ctx.fillRect(x, 0, width, this.props.row_height);
        });
      }
    }
  }

  componentDidMount() {
    this.render_canvas();
  }

  componentDidUpdate() {
    this.render_canvas();
  }

  render() {
    return <canvas ref={this.canvas_ref} width={this.props.full_width} height={this.props.row_height}/>
  }
}

class TimelineBounds {
  @observable start: number = 0
  @observable end: number = 0

  span() {
    return this.end - this.start;
  }

  @action.bound
  set_bounds(start: number, end: number) {
    this.start = start;
    this.end = end;
  }
}

interface TimelineProps {
  intervals: {[key: string]: IntervalSet}
  time_state: TimeState
  timeline_bounds: TimelineBounds
  timeline_width: number
  timeline_height: number
  expand: boolean
  video: DbVideo
  settings?: Settings
  label_state?: BlockLabelState
}

interface DragTimelineState {
  dragging: boolean
  click_x: number
  click_y: number
  click_time: number
  click_start_time: number
  click_end_time: number
}

interface NewIntervalState {
  creating: boolean
  time_start: number
}

interface TimelineState {
  shift_held: boolean
  drag_state: DragTimelineState
  new_state: NewIntervalState
}

/**
 * Box containing intervals time markers.
 *
 * Supports the ability to shift+click+drag to pan the timeline.
 * Also allows user to create new intervals.
 */
@inject("settings", "label_state")
@mouse_key_events
@observer
class Timeline extends React.Component<TimelineProps, {}> {
  state = {
    shift_held: false,
    drag_state: {
      dragging: false, click_x: 0, click_y: 0, click_time: 0, click_start_time: 0, click_end_time: 0
    },
    new_state: {
      creating: false, time_start: 0
    }
  }

  create_interval = () => {
    let newstate = this.state.new_state;
    if (!newstate.creating) {
      let time = this.props.time_state.time;
      let intvls = this.props.label_state!.new_intervals;
      intvls.add(new Interval(
        new Bounds(time), {spatial_type: new SpatialType_Bbox(), metadata: {}}));

      this.setState({new_state: {
        creating: true,
        time_start: time
      }});
    } else {
      this.setState({new_state: {creating: false, time_start: 0}});
    }
  }

  key_bindings = {
    [KeyMode.Standalone]: {
      'i': this.create_interval
    },
    [KeyMode.Jupyter]: {
      'i': this.create_interval
    }
  }


  onKeyDown = (char: string, x: number, y: number) => {
    if (char == 'Shift') {
      this.setState({shift_held: true});
    }
  }

  onKeyUp = (char: string, x: number, y: number) => {
    if (char == 'Shift') {
      this.setState({shift_held: false});
    }

    key_dispatch(this.props.settings!, this.key_bindings, char);
  }

  onMouseLeave = (x: number, y: number) => {
    // Make sure to reset all state so we don't get into a weird situation on re-entering the timeline
    this.state.drag_state.dragging = false;
    this.setState({shift_held: false});
  }

  onMouseDown = (x: number, y: number) => {
    if (this.state.shift_held) {
      // Record all current state so we can compute deltas relative to state at initial click
      let click_time = x_to_time(x, this.props.timeline_bounds, this.props.timeline_width);
      this.setState({
        drag_state: {
          dragging: true,
          click_x: x,
          click_y: y,
          click_time: click_time,
          click_start_time: this.props.timeline_bounds.start,
          click_end_time: this.props.timeline_bounds.end
        }
      });
    }
  }

  onMouseMove = (x: number, y: number) => {
    let drag = this.state.drag_state;
    if (drag.dragging) {
      // Compute new timeline state relative to initial click
      let diff_x = x - drag.click_x;
      let delta = diff_x / this.props.timeline_width * (this.props.timeline_bounds.end - this.props.timeline_bounds.start);
      let duration = this.props.video.num_frames / this.props.video.fps;
      let new_start = drag.click_start_time - delta;
      let new_end = drag.click_end_time - delta;
      if (0 <= new_start && new_end < duration) {
        this.props.timeline_bounds.set_bounds(new_start, new_end);
      }
    }
  }

  onMouseUp = (x: number, y: number) => {
    if (!this.state.drag_state.dragging) {
      // If the user just normally clicks on the timeline, shift the cursor to that point
      this.props.time_state.time = x_to_time(
        x, this.props.timeline_bounds, this.props.timeline_width);
    } else {
      this.state.drag_state.dragging = false;
      this.forceUpdate();
    }
  }

  componentDidUpdate() {
    let time = this.props.time_state.time
    if (time < this.props.timeline_bounds.start || time > this.props.timeline_bounds.end) {
      // TODO: automatically shift timeline bounds if the time changes and it's no longer visible
    }

    if (this.state.new_state.creating) {
      let intvls = this.props.label_state!.new_intervals;
      let target = intvls.to_list()[intvls.to_list().length - 1];
      if (time > this.state.new_state.time_start && time != target.bounds.t2) {
        target.bounds.t2 = time;
        this.forceUpdate();
      }
    }
  }

  render() {
    let keys = _.keys(this.props.intervals);

    let new_intervals = this.props.label_state!.new_intervals;
    if (new_intervals.length() > 0) {
      keys.push('__new_intervals');
    }

    let row_height = this.props.timeline_height / keys.length;
    let time = this.props.time_state.time;

    let video_span = this.props.video.num_frames / this.props.video.fps;
    let window_span = this.props.timeline_bounds.span();
    let full_width = this.props.timeline_width * video_span / window_span;

    return <div className='timeline-box' style={
    {width: this.props.timeline_width, height: this.props.timeline_height}}>
        <div className='timeline-cursor' style={{
          width: this.props.expand ? 4 : 2,
          height: this.props.timeline_height,
          left: time_to_x(time, this.props.timeline_bounds, this.props.timeline_width)
        }} />

        <div className='timeline-window'>
            {keys.map((k, i) =>
              <TimelineRow
                intervals={k == '__new_intervals' ? new_intervals : this.props.intervals[k]}
                row_height={row_height}
                full_width={full_width}
                full_duration={video_span}
                color={default_palette[i]}
              />
            )}
        </div>
    </div>;
  }
}

interface TicksProps {
  timeline_width: number,
  timeline_bounds: TimelineBounds,
  height: number
  num_ticks: number
}

/** Ticks at the bottom of the timeline indicating video time at regular intervals */
@observer class Ticks extends React.Component<TicksProps, {}> {
  private canvas_ref : React.RefObject<HTMLCanvasElement>;

  constructor (props: TicksProps) {
    super(props);
    this.canvas_ref = React.createRef();
  }

  componentDidMount() {
    let start = this.props.timeline_bounds.start;
    let end = this.props.timeline_bounds.end;
    let duration = end - start;
    let ticks = _.range(start, end, duration / this.props.num_ticks);
    const canvas = this.canvas_ref.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.font = '12px sans-serif';
        ctx.textAlign = "center";

        {ticks.map((tick, i) => {
          let hours = Math.floor(tick / 3600);
          let minutes = Math.floor(60 * (tick / 3600 - hours));
          let seconds = Math.floor(60 * (60 * (tick / 3600 - hours) - minutes));
          let time_str = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          let x = time_to_x(tick, this.props.timeline_bounds, this.props.timeline_width);

          ctx.moveTo(x, 0);
          ctx.lineTo(x, this.props.height / 2);
          ctx.fillText(time_str, x, this.props.height);
        })}
        ctx.stroke();
      }
    }
  }

  render() {
    return <canvas ref = {this.canvas_ref} width = {this.props.timeline_width} height = {this.props.height}/>;
  }
}

interface TimelineControlsProps {
  time_state: TimeState
  timeline_bounds: TimelineBounds
  video: DbVideo
  controller_size: number
}

/** Controls for panning and zooming the timeline. */
class TimelineControls extends React.Component<TimelineControlsProps, {}> {
  zoom_in = () => {
    let cur_time = this.props.time_state.time;
    let start = this.props.timeline_bounds.start;
    let end = this.props.timeline_bounds.end;
    let new_start;
    let new_end;
    let new_span = (end - start) / 2;

    if (start <= cur_time && cur_time <= end) {
      // zoom in, centered around current time
      if (cur_time - new_span / 2 > start) {
        // beginning fits
        new_start = cur_time - new_span / 2;
        if (new_start + new_span < end) {
          // both endpoints fit
          new_end = new_start + new_span;
        } else {
          // snap to the end
          new_start = end - new_span;
          new_end = end;
        }
      } else {
        // snap to the beginning
        new_start = start;
        new_end = new_start + new_span;
      }
    } else {
      // zoom in to the middle
      new_start = start + new_span / 4;
      new_end = end - new_span / 4;
    }

    this.props.timeline_bounds.set_bounds(new_start, new_end);
  }

  zoom_out = () => {
    let start = this.props.timeline_bounds.start;
    let end = this.props.timeline_bounds.end;
    let new_start;
    let new_end;

    let new_span = (end - start) * 2;
    let duration = this.props.video.num_frames / this.props.video.fps;

    if (new_span <= duration) {
      if (start - new_span / 4 >= 0) {
        // new beginning will fit
        new_start = start - new_span / 4;
        if (new_start + new_span <= duration) {
          // new end will fit
          new_end = new_start + new_span;
        } else {
          // snap to the end
          new_end = duration;
        }
      } else {
        // snap to the beginning
        new_start = 0;
        new_end = new_span;
      }
    } else {
      new_start = 0;
      new_end = duration;
    }

    this.props.timeline_bounds.set_bounds(new_start, new_end);
  }

  shift_earlier = () => {
    let start = this.props.timeline_bounds.start;
    let end = this.props.timeline_bounds.end;
    if (start > 0) {
      let span = end - start;
      let shift = span / 2;
      if (start - shift > 0) {
        this.props.timeline_bounds.set_bounds(start - shift, end - shift);
      } else {
        this.props.timeline_bounds.set_bounds(0, span);
      }
    }
  }

  shift_later = () => {
    let start = this.props.timeline_bounds.start;
    let end = this.props.timeline_bounds.end;
    let duration = this.props.video.num_frames / this.props.video.fps;

    if (end < duration) {
      let span = end - start;
      let shift = span / 2;

      if (end + shift < duration) {
        this.props.timeline_bounds.set_bounds(start + shift, end + shift);
      } else {
        this.props.timeline_bounds.set_bounds(duration - span, duration);
      }
    }
  }

  shouldComponentUpdate(new_props: TimelineControlsProps, new_state: {}) {
    /* Once the timeline controls are drawn, they should never update.
     * This prevents the buttons from redrawing while the video is playing, causing buttons
     * to miss mouse clicks. */
    return false;
  }

  render() {
    let ControllerButton = (props: {callback: () => void, cls: string}) =>
      (<button type="button" className="btn btn-outline-dark" onClick={props.callback}
               style={{width: this.props.controller_size/2, height: this.props.controller_size/2}}>
          <span className={`oi oi-${props.cls}`} />
      </button>);

    let controls_style = {
      width: this.props.controller_size,
      height: this.props.controller_size
    };

    return <div className='timeline-controls' style={controls_style}>
        <span className="btn-group">
            <ControllerButton callback={this.zoom_in} cls="plus" />
            <ControllerButton callback={this.zoom_out} cls="minus" />
            <ControllerButton callback={this.shift_earlier} cls="caret-left" />
            <ControllerButton callback={this.shift_later} cls="caret-right" />
        </span>
    </div>;
  }
}

interface TimelineTrackProps {
  intervals: {[key: string]: IntervalSet}
  time_state: TimeState,
  video: DbVideo,
  expand: boolean,
  width: number,
  height: number
}

/**
 * Component that shows the temporal extent of all intervals within a block.
 * Each set of intervals is drawn in a different row.
 */
export default class TimelineTrack extends React.Component<TimelineTrackProps, {}> {
  /**
   * The timeline view shows all intervals between some bounds [t1, t2]. These bounds can
   * be adjusted using timeline controls.
   */
  timeline_bounds: TimelineBounds

  constructor(props: TimelineTrackProps) {
    super(props);

    // Initialize default timeline bounds to [0, video duration].
    this.timeline_bounds = new TimelineBounds();
    this.timeline_bounds.set_bounds(0, props.video.num_frames / props.video.fps);
  }

  render() {
    let timeline_width = this.props.width;
    let timeline_height =
      this.props.expand
      ? Constants.timeline_expanded_height
      : Constants.timeline_unexpanded_height;

    let controller_size = timeline_height;
    let track_width = this.props.expand ? timeline_width + controller_size : timeline_width;

    return <div className='timeline-track' style={{width: track_width}}>
        <div className='timeline-row'>

            <Timeline
              timeline_bounds={this.timeline_bounds}
              timeline_width={timeline_width}
              timeline_height={timeline_height}
              time_state={this.props.time_state}
              intervals={this.props.intervals}
              expand={this.props.expand}
              video={this.props.video} />

            {this.props.expand
            ? (<TimelineControls
                 timeline_bounds={this.timeline_bounds} video={this.props.video}
                 time_state={this.props.time_state} controller_size={controller_size} />)
            : null }

            <div className='clearfix' />
        </div>

        <div className='timeline-row'>
            {this.props.expand
            ? <Ticks
                timeline_width={timeline_width}
                timeline_bounds={this.timeline_bounds}
                height={Constants.tick_height}
                num_ticks={Constants.num_ticks} />
            : null}
            <div className='clearfix' />
        </div>
    </div>;
  }
}
