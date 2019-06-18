import * as React from "react";
import * as _ from 'lodash';
import {observer, inject} from 'mobx-react';

import TimeState from './time_state';
import {NamedIntervalSet, Domain_Video} from './interval';
import ProgressiveImage from './progressive_image';
import {asset_url} from './utils';
import {DbVideo} from './database';
import {KeyMode, key_dispatch} from './keyboard';
import {mouse_key_events} from './events';
import {Settings} from './settings';
import {Video} from './video';
import {SpatialOverlay} from './spatial_overlay';

interface VideoTrackProps {
  /** Intervals to draw over the video */
  intervals: NamedIntervalSet[]

  thumb: boolean,

  /** Video metadata */
  video: DbVideo,

  time_state: TimeState,
  expand: boolean,

  /** Desired width of video track in pixels */
  width: number,

  /** Desired height of video track in pixels */
  height: number,

  /* Injected */
  settings?: Settings,
  
  onExpand: () => void
}

interface VideoTrackState {
  video_active: boolean
}

/**
 * Component for a video and spatial metadata on top of it (via [[SpatialOverlay]]).
 * @noInheritDoc
 */
@inject("settings")
@mouse_key_events
@observer
export default class VideoTrack extends React.Component<VideoTrackProps, VideoTrackState> {
  state = {video_active: false}
  video: any

  constructor(props: VideoTrackProps) {
    super(props);
    this.video = React.createRef();
  }

  play_video = () => {
    this.setState({video_active: true});
    this.video.current.toggle();
  }

  key_bindings = {
    [KeyMode.Standalone]: {
      'p': this.play_video
    },
    [KeyMode.Jupyter]: {
      ';': this.play_video
    }
  }

  onKeyDown = (key: string) => {
    key_dispatch(this.props.settings!, this.key_bindings, key);
  }

  componentDidUpdate(prev_props: VideoTrackProps) {
    if (!this.props.expand && this.state.video_active) {
      this.setState({video_active: false});
    }
  }

  onMouseDown = (x: number, y: number) => {
    if(this.props.thumb)
      this.props.onExpand();
  }

  render() {
    // Get current frame
    let time = this.props.time_state.time;
    let video = this.props.video;
    let frame = Math.round(time * video.fps);

    // Get assets paths
    let image_path =
      `${this.props.settings!.frameserver_endpoint}?path=${encodeURIComponent(video.path)}&frame=${frame}`;
    let video_path =
      `${this.props.settings!.video_endpoint}/${video.path}`;

    return <div className='video-track'>

      {!this.props.settings!.use_frameserver || this.state.video_active
       ? <Video src={video_path} width={this.props.width} height={this.props.height}
                time_state={this.props.time_state} expand={this.props.expand}
                video={this.props.video} ref={this.video} />
       : <ProgressiveImage
           src={image_path} width={video.width} height={video.height}
           target_width={this.props.width} target_height={this.props.height} />}

      <div className='track-overlay'>
        <SpatialOverlay
          time={time}
          intervals={this.props.intervals} width={this.props.width}
          height={this.props.height} />
      </div>

    </div>;
  }
}
