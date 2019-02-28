import * as React from "react";

import TimeState from './time_state';

interface VideoProps {
  src: string,
  width: number,
  height: number,
  time_state: TimeState,
  onLoaded?: (video: any) => void,
}

export class Video extends React.Component<VideoProps, {}> {
  video: any

  constructor(props: VideoProps) {
    super(props);
    this.video = React.createRef();
  }

  onTimeUpdate = (video: any) => {
    if (video) {
      this.props.time_state.time = video.currentTime;
    }
  }

  componentDidMount() {
    let delegate = (k: string, f: (video: any) => void) => {
      this.video.current.addEventListener(k, () => f(this.video.current));
    };

    if (this.props.onLoaded) {
      delegate('loadeddata', this.props.onLoaded);
    }

    delegate('timeupdate', this.onTimeUpdate);
  }

  componentDidUpdate() {
    let target_time = this.props.time_state.time;
    if (target_time != this.video.current.currentTime) {
      this.video.current.currentTime = target_time;
    }
  }

  componentWillUnmount() {
    // Make sure video is paused when the component unmounts. Have observed audio continuing to play
    // after unmounting.
    this.video.current.pause();
  }

  render() {
    return <video controls autoPlay style={{width: this.props.width, height: this.props.height}}
           ref={this.video}>
      <source src={this.props.src} />
    </video>
  }
}
