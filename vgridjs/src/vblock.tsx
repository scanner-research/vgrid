import * as React from "react";
import * as _ from 'lodash';
import {observer, inject, Provider} from 'mobx-react';
import classNames from 'classnames';

import TimeState from './time_state';
import VideoTrack from './video_track';
import TimelineTrack from './timeline_track';
import {MetadataTrack} from './metadata_track';
import {IntervalSet, Bounds, vdata_from_json} from './interval';
import {KeyMode, key_dispatch} from './keyboard';
import {Database, DbVideo} from './database';
import {Settings} from './settings';
import {mouse_key_events} from './events';
import CaptionTrack from './caption_track';
import {SpatialType_Caption} from './spatial/caption';
import {BlockSelectType, BlockLabelState} from './label_state';

/** Core unit of visualization in the grid for a single video */
export interface IntervalBlock {
  /** Set of named interval sets within the same video **/
  interval_sets: {[key: string]: IntervalSet}

  /** ID of the corresponding video */
  video_id: number
}

export let interval_blocks_from_json = (obj: any): IntervalBlock[] => {
  return obj.map((intervals: any) => {
    let {video_id, interval_dict} = intervals;
    return {
      video_id: video_id,
      interval_sets: _.mapValues(interval_dict, (intervals, name) =>
        (IntervalSet as any).from_json(intervals, vdata_from_json))
    };
  });
};

interface VBlockProps {
  /** Block to render */
  block: IntervalBlock

  /** Callback for when user selects this block */
  on_select: (type: BlockSelectType) => void

  /** Whether this block is selected or not */
  selected: BlockSelectType | null

  label_state: BlockLabelState

  container_width: number

  /* Injected */
  settings?: Settings
  database?: Database
}

interface VBlockState {
  expand: boolean
}

// Hide interval sets with keys beginning with '_' from the timeline
const show_in_timeline = (k: string) => k[0] != '_';

/**
 * Component for an individual block in the grid.
 * @noInheritDoc
 */
@inject("settings", "database")
@mouse_key_events
@observer
export class VBlock extends React.Component<VBlockProps, VBlockState> {
  state = {expand: false}

  time_state: TimeState;
  captions: IntervalSet | null;

  constructor(props: VBlockProps) {
    super(props);

    // Compute earliest time in all interval blocks to determine where to start the timeline
    let first_time =
      _.values(
        _.pick(props.block.interval_sets,
          _.keys(props.block.interval_sets).filter(show_in_timeline))
      ).reduce(
        (n, is) => (is.length() > 0) ? Math.min(n, is.arbitrary_interval()!.bounds.t1) : n,
        Infinity);
    this.time_state = new TimeState(first_time);

    // Find captions in interval sets if they exist
    this.captions = null;
    for (let k of _.keys(this.props.block.interval_sets)) {
      let is = this.props.block.interval_sets[k];
      if (is.length() > 0 &&
            is.arbitrary_interval()!.data.spatial_type instanceof SpatialType_Caption) {
        this.captions = is;
      }
    }
  }

  toggle_expand = () => {this.setState({expand: !this.state.expand});}

  select = (type: BlockSelectType) => () => { this.props.on_select(type); }

  key_bindings = {
    [KeyMode.Standalone]: {
      'f': this.toggle_expand,
      's': this.select(BlockSelectType.Positive),
      'x': this.select(BlockSelectType.Negative),
    },
    [KeyMode.Jupyter]: {
      '=': this.toggle_expand,
    }
  }

  onKeyUp = (key: string) => {
    key_dispatch(this.props.settings!, this.key_bindings, key);
  }

  /** Get the intervals from all sets that overlap with the current time. */
  current_intervals = (): {[key: string]: IntervalSet} => {
    let bounds = new Bounds(this.time_state.time);
    let current_intervals: {[key: string]: IntervalSet} = {};
    _.keys(this.props.block.interval_sets).forEach((k) => {
      current_intervals[k] = this.props.block.interval_sets[k].time_overlaps(bounds);
    });

    let new_intervals = this.props.label_state.new_intervals.time_overlaps(bounds);
    if (new_intervals.length() > 0) {
      current_intervals['__new_intervals'] = new_intervals;
    }

    return current_intervals;
  }

  render() {
    let current_intervals = this.current_intervals();

    // Get video metadata out of the database
    let video = this.props.database!.table('videos').lookup<DbVideo>(this.props.block.video_id);

    // Compute block height
    let height;
    let width;
    if (!this.state.expand) {
      height = 100;
      width = video.width * (height / video.height);
    } else {
      width = Math.min(video.width, this.props.container_width);
      height = video.height * (width / video.width);
    }

    let args = {
      time_state: this.time_state,
      video: video,
      expand: this.state.expand,
      width: width,
      height: height
    };

    let select_class =
      this.props.selected
      ? (this.props.selected == BlockSelectType.Positive ? 'select-positive'
       : this.props.selected == BlockSelectType.Negative ? 'select-negative'
       : '')
      : '';

    return (
      <Provider label_state={this.props.label_state} time_state={this.time_state}>
        <div className={classNames({vblock: true, expanded: this.state.expand})}>
          <div className={`vblock-highlight ${select_class}`}>
            <div className='vblock-row'>
              <VideoTrack intervals={current_intervals} {...args} />
              <MetadataTrack intervals={current_intervals} {...args} />
              <div className='clearfix' />
            </div>
            {this.props.settings!.show_timeline
             ? <div className='vblock-row'>
               <TimelineTrack intervals={_.pick(this.props.block.interval_sets,
                 _.keys(this.props.block.interval_sets).filter(show_in_timeline)
               )} {...args} />
             </div>
             : null}
            {this.captions !== null
             ? <div className='vblock-row'>
               <CaptionTrack intervals={this.captions} delimiter={"> > "} {...args} />
             </div>
             : null}
          </div>
        </div>
      </Provider>
    );
  }
}
