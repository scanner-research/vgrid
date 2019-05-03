import * as React from "react";
import {inject} from 'mobx-react';

import Spinner from './spinner';
import TimeState from './time_state';
import {DbVideo} from './database';

interface VideoProps {
  /** Path to the video */
  src: string,

  /** Width in pixels */
  width: number,

  /** Height in pixels */
  height: number,

  video: DbVideo,
  time_state: TimeState,
  expand: boolean,
}

export class Video extends React.Component<VideoProps, {loaded: boolean}> {
  state = {loaded: false}
  video: any
  unmount_callbacks: (() => void)[]

  constructor(props: VideoProps) {
    super(props);
    this.video = React.createRef();
    this.unmount_callbacks = [];
  }

  onTimeUpdate = (video: any) => {
    if (video && video.currentTime) {
      this.props.time_state.time = video.currentTime;
    }
  }

  onLoaded = (video: any) => {
    this.setState({loaded: true});
  }

  onLoadedMetadata = (video: any) => {
    // If not using the frameserver, then we need to get the video to load at the same frame as
    // the interval. However, what seems to happen is that in some cases, the video loads a frame
    // early, which then causes the time_state to get set to the wrong frame in onTimeUpdate.
    // For now, we'll hack around that by adding 1 frame to the desired load time.
    video.currentTime = this.props.time_state.time + 1 / this.props.video.fps;
  }

  play = () => {
    this.video.current.play();
  }

  pause = () => {
    this.video.current.pause();
  }

  toggle = () => {
    if (this.video.current.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  componentDidMount() {
    // Add DOM events once video element has loaded onto the page
    let delegate = (k: string, f: (video: any) => void) => {
      let callback = () => f(this.video.current);
      this.video.current.addEventListener(k, callback);
      this.unmount_callbacks.push(() => this.video.current.removeEventListener(k, callback));
    };

    delegate('loadeddata', this.onLoaded);
    delegate('timeupdate', this.onTimeUpdate);
    delegate('loadedmetadata', this.onLoadedMetadata);
  }

  componentDidUpdate() {
    if (this.video.current) {
      // Seek video to current time if it's different than video time
      let target_time = this.props.time_state.time;
      if (target_time != this.video.current.currentTime) {
        this.video.current.currentTime = target_time;
      }

      // Stop playing video if block is no longer expanded
      if (!this.props.expand) {
        this.pause();
      }
    }
  }

  componentWillUnmount() {
    // Make sure video is paused when the component unmounts. Have observed audio continuing to play
    // after unmounting.
    this.pause();

    this.unmount_callbacks.forEach((c) => c());
  }

  render() {
    let video_style = {
      width: this.props.width,
      height: this.props.height,
      display: this.state.loaded ? 'block' : 'none'
    };

    return <div>
      <video controls={false} style={video_style} ref={this.video}>
        <source src={`${this.props.src}`} />
      </video>
      {!this.state.loaded ? <Spinner width={this.props.width} height={this.props.height} /> : null}
    </div>
  }
}
