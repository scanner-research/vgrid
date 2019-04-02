import * as React from "react";

import Spinner from './spinner';
import TimeState from './time_state';

interface VideoProps {
  src: string,
  width: number,
  height: number,
  time_state: TimeState,
  expand: boolean,
}

export class Video extends React.Component<VideoProps, {loaded: boolean}> {
  state = {loaded: false}
  video: any

  constructor(props: VideoProps) {
    super(props);
    this.video = React.createRef();
  }

  onTimeUpdate = (video: any) => {
    if (video && video.currentTime) {
      this.props.time_state.time = video.currentTime;
    }
  }

  onLoaded = (video: any) => {
    this.setState({loaded: true});
  }

  play = () => {
    this.video.current.play();
  }

  pause = () => {
    this.video.current.play();
  }

  componentDidMount() {
    let delegate = (k: string, f: (video: any) => void) => {
      this.video.current.addEventListener(k, () => f(this.video.current));
    };

    delegate('loadeddata', this.onLoaded);
    delegate('timeupdate', this.onTimeUpdate);
  }

  componentDidUpdate() {
    if (this.video.current) {
      let target_time = this.props.time_state.time;
      if (target_time != this.video.current.currentTime) {
        this.video.current.currentTime = target_time;
      }

      if (!this.props.expand) {
        this.video.current.pause();
      }
    }
  }

  componentWillUnmount() {
    // Make sure video is paused when the component unmounts. Have observed audio continuing to play
    // after unmounting.
    this.video.current.pause();
  }

  render() {
    let video_style = {
      width: this.props.width,
      height: this.props.height,
      display: this.state.loaded ? 'block' : 'none'
    };



    return <div>
      <video controls={this.props.expand} style={video_style} ref={this.video}>
        <source src={`${this.props.src}#t=${this.props.time_state.time}`} />
      </video>
      {!this.state.loaded ? <Spinner width={this.props.width} height={this.props.height} /> : null}
    </div>
  }
}
