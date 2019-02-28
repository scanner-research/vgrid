import * as React from "react";
import * as _ from 'lodash';
import {observer} from 'mobx-react';

import {IntervalSet, Interval, Bounds} from './interval';
import TimeState from './time_state';
import {DbVideo} from './database';
import {default_palette} from './color';
import {click_listener} from './events';

interface TimelineIntervalProps {
  interval: Interval
  width: number,
  height: number,
  color: string
}

// Single interval of a set
class TimelineInterval extends React.Component<TimelineIntervalProps, {}> {
  render() {
    let style = {
      width: this.props.width,
      height: this.props.height,
      backgroundColor: this.props.color
    }

    return <div className='timeline-interval' style={style}></div>;
  }
}

interface TimelineRowProps {
  intervals: IntervalSet,
  row_height: number
  timeline_width: number
  timeline_start: number
  timeline_end: number,
  color: string
}

function time_to_x(t: number, start: number, end: number, width: number): number {
  return (t - start) / (end - start) * width;
}

function x_to_time(x: number, start: number, end: number, width: number): number {
  return x / width * (end - start) + start;
}

// Single row of the timeline corresponding to one interval set
class TimelineRow extends React.Component<TimelineRowProps, {}> {
  render() {
    return <div className='timeline-row'>
      {this.props.intervals.to_list().map((intvl, i) => {
         let bounds = intvl.bounds;
         let timeline_duration = (this.props.timeline_end - this.props.timeline_start);
         let left = time_to_x(
           bounds.t1, this.props.timeline_start, this.props.timeline_end, this.props.timeline_width);
         let style = {left: left};

         let right = time_to_x(
           bounds.t2, this.props.timeline_start, this.props.timeline_end, this.props.timeline_width);
         let width = right - left;
         if (width == 0) {
           width = 1;
         }

         return <div className='timeline-interval-wrapper' style={style} key={i} >
           <TimelineInterval
             interval={intvl} width={width} height={this.props.row_height} color={this.props.color}/>
         </div>;
      })}
    </div>;
  }
}

interface TicksProps {
  timeline_width: number,
  timeline_start: number,
  timeline_end: number,
  height: number
}

// Ticks at the bottom of the timeline indicating video time at regular intervals
let Ticks: React.SFC<TicksProps> = (props) => {
  let start = props.timeline_start;
  let end = props.timeline_end;
  let duration = end - start;
  let ticks = _.range(start, end, duration / 10);

  return <svg className='timeline-ticks' style={{width: props.timeline_width, height: props.height}}>
    {ticks.map((tick, i) => {
       let hours = Math.floor(tick / 3600);
       let minutes = Math.floor(60 * (tick / 3600 - hours));
       let seconds = Math.floor(60 * (60 * (tick / 3600 - hours) - minutes));
       let time_str = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
       let x = time_to_x(tick, start, end, props.timeline_width);

       return <g key={i}>
         <line
           x1={x} x2={x} y1={0} y2={props.height / 2}
           stroke="black" strokeWidth={1} />
         <text x={x} y={props.height} textAnchor="middle">{time_str}</text>
       </g>;
    })}
  </svg>;
};

interface TimelineTrackProps {
  intervals: {[key: string]: IntervalSet}
  time_state: TimeState,
  video: DbVideo,
  expand: boolean,
  target_width: number,
  target_height: number
}

interface TimelineTrackState {
  timeline_start: number,
  timeline_end: number
}

@click_listener
@observer
export default class TimelineTrack extends React.Component<TimelineTrackProps, TimelineTrackState> {
  state = {timeline_start: 0, timeline_end: 0}

  constructor(props: TimelineTrackProps) {
    super(props);
    this.state.timeline_end = this.props.video.num_frames / this.props.video.fps;
  }

  onClick = (x: number, y: number) => {
    this.props.time_state.time = x_to_time(
      x, this.state.timeline_start, this.state.timeline_end, this.props.target_width);
  }

  render() {
    let timeline_width = this.props.target_width;
    let timeline_height = this.props.expand ? 100 : 50;

    let keys = _.keys(this.props.intervals);
    let row_height = timeline_height / keys.length;

    let time = this.props.time_state.time;
    let Cursor = () => <div className='timeline-cursor' style={{
      width: this.props.expand ? 4 : 2,
      height: timeline_height,
      left: (time - this.state.timeline_start) / (this.state.timeline_end - this.state.timeline_start) * timeline_width
    }} />;

    return <div className='timeline-track' style={{width: timeline_width}}>
      <div className='timeline-box' style={{height: timeline_height}}>
        <Cursor />
        {keys.map((k, i) => {
           let style = {top: row_height * i};
           return <div key={k} className='timeline-row-wrapper' style={style}>
             <TimelineRow
               intervals={this.props.intervals[k]}
               row_height={row_height}
               timeline_width={timeline_width}
               timeline_start={this.state.timeline_start}
               timeline_end={this.state.timeline_end}
               color={default_palette[i]}
             />
           </div>
        })}
      </div>

      {this.props.expand
       ? <Ticks
           timeline_width={timeline_width}
           timeline_start={this.state.timeline_start}
           timeline_end={this.state.timeline_end}
           height={20} />
       : null}
    </div>;
  }
}
