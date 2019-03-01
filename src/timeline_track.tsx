import * as React from "react";
import * as _ from 'lodash';
import {observable, computed, action} from 'mobx';
import {observer} from 'mobx-react';

import {IntervalSet, Interval, Bounds} from './interval';
import TimeState from './time_state';
import {DbVideo} from './database';
import {default_palette} from './color';
import {mouse_key_events} from './events';

interface TimelineIntervalProps {
  interval: Interval
  width: number,
  height: number,
  color: string
}

// Single interval of a set
class TimelineInterval extends React.Component<TimelineIntervalProps, {}> {
  render() {
    return <rect width={this.props.width} height={this.props.height} fill={this.props.color} />;
  }
}

interface TimelineRowProps {
  intervals: IntervalSet,
  row_height: number
  timeline_width: number
  timeline_bounds: TimelineBounds
  color: string
}

function time_to_x(t: number, bounds: TimelineBounds, width: number): number {
  return (t - bounds.start) / bounds.span() * width;
}

function x_to_time(x: number, bounds: TimelineBounds, width: number): number {
  return x / width * bounds.span() + bounds.start;
}

// Single row of the timeline corresponding to one interval set
class TimelineRow extends React.Component<TimelineRowProps, {}> {
  render() {
    return <g>
      {this.props.intervals.to_list().map((intvl, i) => {
         let bounds = intvl.bounds;
         let timeline_duration = this.props.timeline_bounds.span();
         let x1 = time_to_x(bounds.t1, this.props.timeline_bounds, this.props.timeline_width);

         let x2 = time_to_x(bounds.t2, this.props.timeline_bounds, this.props.timeline_width);
         let width = x2 - x1;
         if (width == 0) {
           width = 1;
         }

         return <svg key={i} x={x1} y={0}>
           <TimelineInterval
             interval={intvl} width={width} height={this.props.row_height} color={this.props.color} />
         </svg>;
      })}
    </g>;
  }
}

class TimelineBounds {
  @observable start: number
  @observable end: number

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
}

interface TimelineState {
  shift_held: boolean
  dragging: boolean
  click_x: number
  click_y: number
  click_time: number
  click_start_time: number
  click_end_time: number
}

@mouse_key_events
@observer
class Timeline extends React.Component<TimelineProps, {}> {
  state = {
    shift_held: false, dragging: false, click_x: 0, click_y: 0, click_time: 0, click_start_time: 0,
    click_end_time: 0
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
  }

  onMouseLeave = (x: number, y: number) => {
    // Make sure to reset all state so we don't get into a weird situation on re-entering the timeline
    this.setState({shift_held: false, dragging: false});
  }

  onMouseDown = (x: number, y: number) => {
    if (this.state.shift_held) {
      // Record all current state so we can compute deltas relative to state at initial click
      let click_time = x_to_time(x, this.props.timeline_bounds, this.props.timeline_width);
      this.setState({
        dragging: true,
        click_x: x,
        click_y: y,
        click_time: click_time,
        click_start_time: this.props.timeline_bounds.start,
        click_end_time: this.props.timeline_bounds.end
      });
    }
  }

  onMouseMove = (x: number, y: number) => {
    if (this.state.dragging) {
      // Compute new timeline state relative to initial click
      let diff_x = x - this.state.click_x;
      let delta = diff_x / this.props.timeline_width * (this.props.timeline_bounds.end - this.props.timeline_bounds.start);
      let duration = this.props.video.num_frames / this.props.video.fps;
      let new_start = this.state.click_start_time - delta;
      let new_end = this.state.click_end_time - delta;
      if (0 <= new_start && new_end < duration) {
        this.props.timeline_bounds.set_bounds(new_start, new_end);
      }
    }
  }

  onMouseUp = (x: number, y: number) => {
    if (!this.state.dragging) {
      // If the user just normally clicks on the timeline, shift the cursor to that point
      this.props.time_state.time = x_to_time(
        x, this.props.timeline_bounds, this.props.timeline_width);
    } else {
      this.setState({dragging: false});
    }
  }

  componentDidUpdate() {
    let time = this.props.time_state.time
    if (time < this.props.timeline_bounds.start || time > this.props.timeline_bounds.end) {
      //this.props.timeline_bounds.start =
    }
  }

  render() {
    let keys = _.keys(this.props.intervals);
    let row_height = this.props.timeline_height / keys.length;
    let time = this.props.time_state.time;

    return <div className='timeline-box' style={
      {width: this.props.timeline_width, height: this.props.timeline_height}}>

      <div className='timeline-cursor' style={{
        width: this.props.expand ? 4 : 2,
        height: this.props.timeline_height,
        left: time_to_x(time, this.props.timeline_bounds, this.props.timeline_width)
      }} />

      <svg width={this.props.timeline_width} height={this.props.timeline_height}>
        {keys.map((k, i) =>
          <svg key={k} y={row_height * i} x={0}>
            <TimelineRow
              intervals={this.props.intervals[k]}
              row_height={row_height}
              timeline_width={this.props.timeline_width}
              timeline_bounds={this.props.timeline_bounds}
              color={default_palette[i]}
            />
          </svg>
        )}
      </svg>
    </div>;
  }
}

interface TicksProps {
  timeline_width: number,
  timeline_bounds: TimelineBounds,
  height: number
  num_ticks: number
}

// Ticks at the bottom of the timeline indicating video time at regular intervals
let Ticks: React.SFC<TicksProps> = observer((props) => {
  let start = props.timeline_bounds.start;
  let end = props.timeline_bounds.end;
  let duration = end - start;
  let ticks = _.range(start, end, duration / props.num_ticks);

  return <svg className='timeline-ticks' style={{width: props.timeline_width, height: props.height}}>
    {ticks.map((tick, i) => {
       let hours = Math.floor(tick / 3600);
       let minutes = Math.floor(60 * (tick / 3600 - hours));
       let seconds = Math.floor(60 * (60 * (tick / 3600 - hours) - minutes));
       let time_str = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
       let x = time_to_x(tick, props.timeline_bounds, props.timeline_width);

       return <g key={i}>
         <line
           x1={x} x2={x} y1={0} y2={props.height / 2}
           stroke="black" strokeWidth={1} />
         <text x={x} y={props.height} textAnchor="middle">{time_str}</text>
       </g>;
    })}
  </svg>;
});

interface TimelineControlsProps {
  time_state: TimeState
  timeline_bounds: TimelineBounds
  video: DbVideo
  controller_size: number
}

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
  target_width: number,
  target_height: number
}

export default class TimelineTrack extends React.Component<TimelineTrackProps, {}> {
  timeline_bounds: TimelineBounds

  constructor(props: TimelineTrackProps) {
    super(props);

    this.timeline_bounds = new TimelineBounds();
    this.timeline_bounds.set_bounds(0, props.video.num_frames / props.video.fps);
  }

  render() {
    let timeline_width = this.props.target_width;
    let timeline_height = this.props.expand ? 100 : 50;

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
             height={20}
             num_ticks={10} />
         : null}
        <div className='clearfix' />
      </div>

    </div>;
  }
}
