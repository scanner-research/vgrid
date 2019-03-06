import * as React from "react";
import * as _ from "lodash";
import {observable, ObservableSet} from 'mobx';
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
import {BlockLabelState} from './label_state';

/* The caption track shows time-aligned captions in a vertically scrolling box and allows
 * labeling through text selection. The main concept in the caption track is the "caption group"
 * which is a set of captions that should be shown grouped together, i.e. on the same word-wrapped
 * line of text. Caption groups are separated by a provided delimiter, e.g. ">>" in TV news.
 */

interface CaptionGroupProps {
  group_index: number,
  group: Interval[],
  time_state: TimeState
  label_state: BlockLabelState
  reverse_index: {[interval: number]: number}
}

let CaptionGroup: React.SFC<CaptionGroupProps> = observer((props: CaptionGroupProps) => {
  let cur_time = new Bounds(props.time_state.time);
  let selected = props.label_state.captions_selected;
  let flags: boolean[] =
    props.group.map((intvl, i) => (
      Object.keys(_.filter(intvl.metadata, (v) => v instanceof Metadata_Flag)).length > 0 ||
      (selected !== undefined && selected.has(props.reverse_index[i]))));

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
});

interface CaptionTrackProps {
  intervals: IntervalSet,
  time_state: TimeState,
  video: DbVideo,
  expand: boolean,
  target_width: number,
  target_height: number,
  delimiter: string
  settings?: Settings
  label_state?: BlockLabelState
}

@inject("settings", "label_state")
@mouse_key_events
@observer
export default class CaptionTrack extends React.Component<CaptionTrackProps, {}> {
  caption_groups: Interval[][]
  flat_to_nested: {[index: number]: {group: number, interval: number}[]}
  nested_to_flat: {[group: number]: {[interval: number]: number}}
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
    let get_index = (node: any): {group: number, interval: number, boundary: boolean} => {
      let parent = node.parentElement;
      let boundary = false;

      // If the spacing span is selected, get the sibling span for the caption
      if (parent.className.indexOf('caption') == -1) {
        parent = parent.parentElement.querySelector('span.caption')!;
        boundary = true;
      }

      let ds = parent.dataset;
      return {group: parseInt(ds.group), interval: parseInt(ds.interval), boundary: boundary};
    };

    let start = get_index(selection.anchorNode);
    let end = get_index(selection.focusNode);

    // If the user selects in reverse (i.e. from right to left), then we have to detect this
    // and swap accordingly
    if (start.group > end.group || (start.group == end.group && start.interval > end.interval)) {
      let tmp = start;
      start = end;
      end = tmp;
    }

    // If the user selected the spacing for the start of the selection, the actual selection should
    // start on the next caption
    if (start.boundary) {
      if (start.interval == this.caption_groups[start.group].length - 1) {
        start = {group: start.group + 1, interval: 0, boundary: false};
      } else {
        start = {group: start.group, interval: start.interval + 1, boundary: false};
      }
    }

    // Add metadata to all captions between start/end
    _.range(start.group, end.group+1).map((group) => {
      let istart = group == start.group ? start.interval : 0;
      let iend = group == end.group ? end.interval+1 : this.caption_groups[group].length;
      _.range(istart, iend).map((interval) => {
        let selected = this.props.label_state!.captions_selected;
        selected.add(this.nested_to_flat[group][interval]);
      });
    });
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
    this.flat_to_nested = {};
    this.nested_to_flat = {};

    let delimiter = props.delimiter;
    let intervals = props.intervals.to_list();

    let current_group: any = [];

    let push_intvl = (intvl: Interval, index: number) => {
      current_group.push(intvl);
      let group = this.caption_groups.length;
      let interval = current_group.length;
      if (!(group in this.nested_to_flat)) { this.nested_to_flat[group] = {}; }
      this.nested_to_flat[group][interval] = index;
    };

    /* Parse through the captions and split them into groups by the provided delimiter.
     * Note that some new intervals will have to be created if an interval contains a delimiter
     * in the middle. */
    intervals.forEach((intvl, index) => {
      let text = (intvl.draw_type as DrawType_Caption).text;
      let parts = text.split(delimiter);

      if (parts.length == 1) {
        push_intvl(intvl, index);
      } else {
        parts.forEach((part, i) => {
          let part_text = (i == 0 ? '' : delimiter) + part;
          push_intvl(
            new Interval(intvl.bounds, new DrawType_Caption(part_text), intvl.metadata), index);

          if (i != parts.length - 1) {
            this.caption_groups.push(current_group);
            current_group = [];
          }
        });
      }
    });

    // Make sure to include the unfinished caption group at the end.
    if (current_group.length > 0) {
      push_intvl(current_group, intervals.length - 1);
    }

    _.map(this.nested_to_flat, (v, k: number) => {
      _.map(v, (index, k2: number) => {
        if (!(index in this.flat_to_nested)) {
          this.flat_to_nested[index] = []
        }

        this.flat_to_nested[index].push({group: k, interval: k2});
      });
    });

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
               <CaptionGroup group={group} group_index={i} time_state={this.props.time_state}
                             label_state={this.props.label_state!}
                             reverse_index={this.nested_to_flat[i]} />
             </div>;
          })}
        </div>
      </div>
    </div>;
  }
}
