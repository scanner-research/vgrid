import * as React from "react";
import * as _ from 'lodash';
import {observer, inject} from 'mobx-react';
import classNames from 'classnames';

import TimeState from './time_state';
import VideoTrack from './video_track';
import TimelineTrack from './timeline_track';
import {MetadataTrack} from './metadata_track';
import {IntervalSet, Bounds, Domain_Video} from './interval';
import {KeyMode, key_dispatch} from './keyboard';
import {Database, DbVideo} from './database';
import {Settings} from './settings';
import {mouse_key_events} from './events';
import CaptionTrack from './caption_track';
import {DrawType_Caption} from './drawable';
import {BlockSelectType} from './select_state';

interface VBlockProps {
  intervals: {[key: string]: IntervalSet}
  on_select: (type: BlockSelectType) => void
  selected: BlockSelectType | null
  settings?: Settings
  database?: Database
}

interface VBlockState {
  expand: boolean
}

@inject("settings", "database")
@mouse_key_events
export class VBlock extends React.Component<VBlockProps, VBlockState> {
  state = {expand: false}

  time_state: TimeState;
  settings: any;
  captions: IntervalSet | null;

  constructor(props: VBlockProps) {
    super(props);

    let first_time =
      _.values(props.intervals).reduce((n, is) => Math.min(n, is.to_list()[0].bounds.t1), Infinity);
    this.time_state = new TimeState(first_time);

    this.captions = null;
    for (let k of _.keys(this.props.intervals)) {
      let is = this.props.intervals[k];
      if (is.to_list()[0].draw_type instanceof DrawType_Caption) {
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

  current_intervals = (): {[key: string]: IntervalSet} => {
    let bounds = new Bounds(this.time_state.time);
    let current_intervals: {[key: string]: IntervalSet} = {};
    _.keys(this.props.intervals).forEach((k) => {
      current_intervals[k] = this.props.intervals[k].time_overlaps(bounds);
    });
    return current_intervals;
  }

  render() {
    console.log('render');

    let example_interval = _.values(this.props.intervals)[0].to_list()[0];
    let current_intervals = this.current_intervals();
    let video_id = (example_interval.bounds.domain as Domain_Video).video_id;
    let video = this.props.database!.tables.videos.lookup<DbVideo>(video_id);

    // Compute asset height
    let target_height;
    let target_width;
    if (!this.state.expand) {
      target_height = 100;
      target_width = video.width * (target_height / video.height);
    } else {
      target_width = video.width;
      target_height = video.height;
    }

    let args = {
      time_state: this.time_state,
      video: video,
      expand: this.state.expand,
      target_width: target_width,
      target_height: target_height
    };

    let select_class =
      this.props.selected
      ? (this.props.selected == BlockSelectType.Positive ? 'select-positive'
       : this.props.selected == BlockSelectType.Negative ? 'select-negative'
       : '')
      : '';

    return (
      <div className={classNames({vblock: true, expanded: this.state.expand})}>
        <div className={`vblock-highlight ${select_class}`}>
          <div className='vblock-row'>
            <VideoTrack intervals={current_intervals} {...args} />
            <MetadataTrack intervals={current_intervals} {...args} />
            <div className='clearfix' />
          </div>
          <div className='vblock-row'>
            <TimelineTrack intervals={this.props.intervals} {...args} />
          </div>
          {this.captions !== null
           ? <div className='vblock-row'>
             <CaptionTrack intervals={this.captions} delimiter={"> > "} {...args} />
           </div>
           : null}
        </div>
      </div>
    );
  }
}
