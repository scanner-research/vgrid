import * as React from "react";
import * as _ from "lodash";
import {inject, observer} from 'mobx-react';
import classNames from 'classnames';

import {IntervalSet, Interval, Bounds} from './interval';
import TimeState from './time_state';
import {DbVideo} from './database';
import {DrawType_Caption} from './drawable';
import {Metadata_Flag, Metadata_CaptionMeta, Metadata_Generic} from './metadata';
import {mouse_key_events} from './events';
import {key_dispatch, KeyMode} from './keyboard';
import {Settings} from './settings';

/* The caption track shows time-aligned captions in a vertically scrolling box and allows
 * labeling through text selection. The main concept in the caption track is the "caption group"
 * which is a set of captions that should be shown grouped together, i.e. on the same word-wrapped
 * line of text. Caption groups are separated by a provided delimiter, e.g. ">>" in TV news.
 */

let CaptionGroup: React.SFC<{group_index: number, group: Interval[], time_state: TimeState}> = (props) => {
  let cur_time = new Bounds(props.time_state.time);
  let flags: boolean[] =
    props.group.map((intvl) =>
      Object.keys(_.filter(intvl.metadata, (v) => v instanceof Metadata_Flag)).length > 0);

  return <div className='caption-group'>{
    props.group.map((intvl, i) => {
      let overlaps = intvl.bounds.time_overlaps(cur_time);
      let flag = flags[i];
      /* TODO: handle Metadata_CaptionMeta */

      return <span key={i}>
        <span className={classNames({caption: true, active: overlaps, flag: flag})}
              data-group={props.group_index} data-interval={i}>
          {(intvl.draw_type as DrawType_Caption).text}
        </span>
        {/* To avoid discontinuously highlighting individual words, we also highlight the spacing
          * if the next caption is also supposed to be highlighted. */}
        <span className={classNames({
            spacing: true, flag: flag && i < props.group.length -1 && flags[i + 1]})}>
            &nbsp;
        </span>
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
  settings?: Settings
}

@inject("settings")
@mouse_key_events
@observer
export default class CaptionTrack extends React.Component<CaptionTrackProps, {}> {
  caption_groups: Interval[][]
  group_refs: any[]
  canvas_ref: any
  settings: Settings | null = null;

  /* Handling text selections is tricky! The HTML selection API allows us to get a pointer to
   * the DOM element for the start and end of the selections. Our main task is to collect all the
   * intervals between the start and end of the selection, and add a labeled flag to each of them.
   *
   * This is complicated by the fact that we have two distinct selectable text items: the captions
   * and the spacing between the captions. We have extra logic that checks if the spacing is
   * selected, and then finds the actual caption as a sibling span.
   *
   * From the data-* attributes on the spans, we can use the HTML .dataset API to get the group
   * and interval indices corresponding to each selected node, which we interpolate between
   * to get the full list of captions to select.
   */
  select_text = () => {
    let selection = window.getSelection();

    // Get the interval indices corresponding to the given selection
    let get_index = (node: any, is_start: boolean): {group: number, interval: number} => {
      let parent = node.parentElement;
      if (parent.className.indexOf('caption') == -1) {
        parent = parent.parentElement.querySelector('span.caption')!;
        let ds = parent.dataset;
        if (is_start) {
          if (ds.interval == this.caption_groups[ds.group].length - 1) {
            return {group: parseInt(ds.group) + 1, interval: 0}
          } else {
            return {group: parseInt(ds.group), interval: parseInt(ds.interval) + 1};
          }
        } else {
          return {group: parseInt(ds.group), interval: parseInt(ds.interval)};
        }
      } else {
        let ds = parent.dataset;
        return {group: parseInt(ds.group), interval: parseInt(ds.interval)};
      }
    }

    let start = get_index(selection.anchorNode, true);
    let end = get_index(selection.focusNode, false);

    // Add metadata to all intervals between start/end
    _.range(start.group, end.group+1).map((group) => {
      let istart = group == start.group ? start.interval : 0;
      let iend = group == end.group ? end.interval+1 : this.caption_groups[group].length;
      _.range(istart, iend).map((interval) => {
        this.caption_groups[group][interval].metadata.flag = new Metadata_Flag();
      });
    });

    // Force update since changing the interval set doesn't cause a re-render
    this.forceUpdate();
  }

  key_bindings = {
    [KeyMode.Standalone]: {
      'l': this.select_text
    }
  }

  onKeyUp = (key: string) => {
    key_dispatch(this.props.settings!, this.key_bindings, key);
  }

  constructor(props: CaptionTrackProps) {
    super(props);

    this.caption_groups = [];

    let delimiter = props.delimiter;
    let intervals = props.intervals.to_list();

    let current_group: any = [];

    /* Parse through the captions and split them into groups by the provided delimiter.
     * Note that some new intervals will have to be created if an interval contains a delimiter
     * in the middle. */
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

    // Make sure to include the unfinished caption group at the end.
    if (current_group.length > 0) {
      this.caption_groups.push(current_group);
    }

    // If the first caption contains a delimiter, then this edge case will create an empty
    // first caption group, so we remove it.
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

      // Find the latest caption group less than the current time
      let current_group = 0;
      for (let [i, group] of this.caption_groups.entries()) {
        if (group[group.length - 1].bounds.t1 >= cur_time) {
          current_group = i;
          break;
        }
      }

      // Compute the y position at the middle of the caption group, and vertically center the
      // caption bound around it
      let group_rect = this.group_refs[current_group].current.getBoundingClientRect();
      let group_top = group_rect.y - canvas_rect.y;
      let group_middle = group_top + group_rect.height / 2;

      top = group_middle - track_style.height / 2;
    }

    return <div className='caption-track' style={track_style}>
      <div className='caption-window'>
        <div className='caption-canvas' style={{top: -top, width: track_style.width}}
             ref={this.canvas_ref}>
          {this.caption_groups.map((group, i) => {
             return <div key={i} ref={this.group_refs[i]}>
               <CaptionGroup group={group} group_index={i} time_state={this.props.time_state} />
             </div>;
          })}
        </div>
      </div>
    </div>;
  }
}
