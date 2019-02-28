import * as React from "react";
import * as _ from 'lodash';
import {observer} from 'mobx-react';

import TimeState from './time_state';
import VideoTrack from './video_track';
import TimelineTrack from './timeline_track';
import {MetadataTrack} from './metadata_track';
import {IntervalSet, Bounds, Domain_Video} from './interval';
import {KeyMode, key_dispatch} from './keyboard';
import {Database, DbVideo} from './database';
import {DatabaseContext, SettingsContext, Consumer} from './contexts';
import {Settings} from './settings';
import {mouseover_key_listener} from './events';


interface VBlockProps {
  intervals: {[key: string]: IntervalSet}
}

interface VBlockState {
  expand: boolean
}

@mouseover_key_listener
@observer
export class VBlock extends React.Component<VBlockProps, VBlockState> {
  state = {expand: false}

  time_state: TimeState;
  settings: any;

  constructor(props: VBlockProps) {
    super(props);

    let first_time =
      _.values(props.intervals).reduce((n, is) => Math.min(n, is.to_list()[0].bounds.t1), Infinity);
    this.time_state = new TimeState(first_time);
  }

  toggle_expand = () => {this.setState({expand: !this.state.expand});}

  key_bindings = {
    [KeyMode.Standalone]: {
      'f': this.toggle_expand
    },
    [KeyMode.Jupyter]: {
      '=': this.toggle_expand
    }
  }

  onKeyDown = (key: string) => {
    key_dispatch(this.settings, this.key_bindings, key);
  }

  current_intervals = () => {
    let bounds = new Bounds(this.time_state.time);
    let current_intervals = new IntervalSet([]);
    for (let is of _.values(this.props.intervals)) {
      current_intervals = current_intervals.union(is.time_overlaps(bounds));
    }
    return current_intervals;
  }

  render() {
    let example_interval = _.values(this.props.intervals)[0].to_list()[0];
    let current_intervals = this.current_intervals();
    return <div className={'vblock ' + (this.state.expand ? 'expanded' : '')}>
      <Consumer contexts={[DatabaseContext, SettingsContext]}>{
        (database: Database, settings: Settings) => {
          this.settings = settings;
          let video_id = (example_interval.bounds.domain as Domain_Video).video_id;
          let video = database.tables.videos.lookup<DbVideo>(video_id);

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

          return (<div>
            <VideoTrack intervals={current_intervals} {...args} />
            <MetadataTrack intervals={current_intervals} {...args} />
            <TimelineTrack intervals={this.props.intervals} {...args} />
          </div>);
        }
      }</Consumer>
    </div>;
  }
}
