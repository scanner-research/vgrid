import * as React from "react";
import * as _ from 'lodash';
import {observer} from 'mobx-react';

import Spinner from './spinner';
import TimeState from './time_state';
import {IntervalSet, Domain_Video} from './interval';
import ProgressiveImage from './progressive_image';
import {asset_url} from './utils';
import {DbVideo} from './database';
import {SettingsContext, Consumer} from './contexts';
import {KeyMode, key_dispatch} from './keyboard';
import {mouse_key_events} from './events';
import {Settings} from './settings';
import {Video} from './video';
import {SpatialOverlay} from './spatial_overlay';

interface VideoTrackProps {
  intervals: IntervalSet,
  time_state: TimeState,
  video: DbVideo,
  expand: boolean,
  target_width: number,
  target_height: number
}

interface VideoTrackState {
  video_loaded: boolean,
  video_active: boolean
}

@mouse_key_events
@observer
export default class VideoTrack extends React.Component<VideoTrackProps, VideoTrackState> {
  state = {video_loaded: false, video_active: false}
  settings: Settings

  play_video = () => {
    this.setState({video_active: true});
  }

  key_bindings = {
    [KeyMode.Standalone]: {
      'p': this.play_video
    },
    [KeyMode.Jupyter]: {
      'TODO': this.play_video
    }
  }

  onKeyDown = (key: string) => {
    key_dispatch(this.settings, this.key_bindings, key);
  }

  onVideoLoaded = () => {
    this.setState({video_loaded: true});
  }

  componentDidUpdate(prev_props: VideoTrackProps) {
    if (!this.props.expand && this.state.video_active) {
      this.setState({video_active: false, video_loaded: false});
    }
  }

  render() {
    return <Consumer contexts={[SettingsContext]}>{
      (settings: Settings) => {
        this.settings = settings;

        // Get current frame
        let time = this.props.time_state.time;
        let video = this.props.video;
        let frame = Math.round(time * video.fps);

        // Get assets paths
        let image_path = asset_url(
          `${settings.endpoints.frames}?path=${encodeURIComponent(video.path)}&frame=${frame}`);
        let video_path = asset_url(`${settings.endpoints.videos}/${video.path}`);

        return <div className='video-track'>
          {this.state.video_active
           ? <div>
             <Video src={video_path} width={this.props.target_width} height={this.props.target_height}
                    time_state={this.props.time_state} onLoaded={this.onVideoLoaded} />
             {!this.state.video_loaded ? <div className='loading-video'><Spinner /></div> : null}
           </div>
           : <ProgressiveImage
               src={image_path} width={video.width} height={video.height}
               target_width={this.props.target_width} target_height={this.props.target_height} />}
          <div className='track-overlay'>
            <SpatialOverlay
              intervals={this.props.intervals} width={this.props.target_width}
              height={this.props.target_height} />
          </div>
        </div>
      }}
    </Consumer>;
  }
}
