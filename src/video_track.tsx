import * as React from "react";
import * as _ from 'lodash';
import {observer} from 'mobx-react';
import Spinner from './spinner';
import TimeState from './time_state';
import {IntervalSet, Domain_Video} from './interval';
import ProgressiveImage from './progressive_image';
import {asset_url} from './utils';
import {Database, DbVideo} from './database';
import {DatabaseContext, SettingsContext, Consumer} from './contexts';
import {KeyMode, key_dispatch, mouseover_key_listener} from './keyboard';
import {Settings} from './settings';

interface VideoProps {
  src: string
}

class Video extends React.Component<VideoProps, {}> {
  render() {
    return <video controls><source src={this.props.src} /></video>
  }
}


interface VideoTrackProps {
  intervals: {[key: string]: IntervalSet},
  time_state: TimeState,
  expand: boolean
}

enum VideoIOState {
  Off = 1,
  Loading = 2,
  Showing = 3
}

interface VideoTrackState {
  video_io_state: VideoIOState
}

@mouseover_key_listener
@observer
export default class VideoTrack extends React.Component<VideoTrackProps, VideoTrackState> {
  state = {video_io_state: VideoIOState.Off}

  play_video = () => {
    this.setState({video_io_state: VideoIOState.Loading});
  }

  key_bindings = {
    [KeyMode.Standalone]: {
      'p': this.play_video
    },
    [KeyMode.Jupyter]: {
      'TODO': this.play_video
    }
  }

  render() {
    return <Consumer contexts={[DatabaseContext, SettingsContext]}>{(database: Database, settings: Settings) => {
      let example_set = _.values(this.props.intervals)[0];
      let example_interval = example_set.intervals[0];
      let domain = example_interval.bounds.domain;

      let video_id;
      if (domain instanceof Domain_Video) {
        video_id = domain.video_id;
      } else {
        throw Error(`Unsupported domain: ${domain}`);
      }

      let time = this.props.time_state.time;

      let video = database.tables.videos.lookup<DbVideo>(video_id);
      let frame = Math.round(time * video.fps);

      let preview_path = asset_url(
        `${settings.endpoints.frames}?path=${encodeURIComponent(video.path)}&frame=${frame}`);

      let target_height = undefined;
      if (!this.props.expand) {
        target_height = 100;
      }

      return <div className='video-track'>
        <ProgressiveImage src={preview_path} width={video.width} height={video.height} target_height={target_height} />
      </div>
    }}</Consumer>;
  }
}
