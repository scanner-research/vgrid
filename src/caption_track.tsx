import * as React from "react";
import * as _ from "lodash";

import {IntervalSet, Interval, Bounds} from './interval';
import TimeState from './time_state';
import {DbVideo} from './database';
import {DrawType_Caption} from './drawable';
import {Metadata_Flag} from './metadata';

let CaptionGroup: React.SFC<{group: Interval[], time_state: TimeState}> = (props) => {
  let cur_time = new Bounds(props.time_state.time);
  return <div className='caption-group'>{
    props.group.map((intvl, i) => {
      let overlaps = intvl.bounds.time_overlaps(cur_time);
      let flag = Object.keys(_.filter(intvl.metadata, (v) => v instanceof Metadata_Flag)).length;
      return <span key={i}>
        <span className={'caption ' + (overlaps ? 'active ' : ' ') + (flag ? 'flag' : ' ')}>
          {(intvl.draw_type as DrawType_Caption).text}
        </span> &nbsp;
      </span>
    })
  }</div>;
};

interface CaptionTrackProps {
  intervals: IntervalSet,
  time_state: TimeState,
  video: DbVideo,
  expand: boolean,
  target_width: number,
  target_height: number,
  delimiter: string
}

export default class CaptionTrack extends React.Component<CaptionTrackProps, {}> {
  caption_groups: Interval[][]
  group_refs: any[]
  canvas_ref: any

  constructor(props: CaptionTrackProps) {
    super(props);

    this.caption_groups = [];

    let delimiter = props.delimiter;
    let intervals = props.intervals.to_list();

    let current_group: any = [];

    intervals.forEach(intvl => {
      let text = (intvl.draw_type as DrawType_Caption).text;
      let parts = text.split(delimiter);

      if (parts.length == 1) {
        current_group.push(intvl);
      } else {
        parts.forEach((part, i) => {
          let part_text = (i == 0 ? '' : delimiter) + part;
          current_group.push(new Interval(intvl.bounds, new DrawType_Caption(part_text), intvl.metadata));

          if (i != parts.length - 1) {
            this.caption_groups.push(current_group);
            current_group = [];
          }
        });
      }
    });

    this.caption_groups.push(current_group);

    if ((this.caption_groups[0][0].draw_type as DrawType_Caption).text == '') {
      this.caption_groups.splice(0, 1);
    }

    this.canvas_ref = React.createRef();
    this.group_refs = this.caption_groups.map((_) => React.createRef());
  }

  componentDidMount() {
    this.forceUpdate();
  }

  render() {
    let track_style = {
      width: this.props.target_width,
      height: this.props.expand ? 200 : 50
    };

    let cur_time = this.props.time_state.time;

    let top = 0;
    if (this.group_refs[0].current) {
      let canvas_rect = this.canvas_ref.current.getBoundingClientRect();

      let current_group = 0;
      for (let [i, group] of this.caption_groups.entries()) {
        if (group[group.length - 1].bounds.t1 >= cur_time) {
          current_group = i;
          break;
        }
      }

      let group_rect = this.group_refs[current_group].current.getBoundingClientRect();
      let group_top = group_rect.y - canvas_rect.y;
      let group_middle = group_top + group_rect.height / 2;

      top = group_middle - track_style.height / 2;
    }

    return <div className='caption-track' style={track_style}>
      <div className='caption-window'>
        <div className='caption-canvas' style={{top: -top}} ref={this.canvas_ref}>
          {this.caption_groups.map((group, i) => {
             return <div key={i} ref={this.group_refs[i]}>
               <CaptionGroup group={group} time_state={this.props.time_state} />
             </div>;
          })}
        </div>
      </div>
    </div>;
  }
}
