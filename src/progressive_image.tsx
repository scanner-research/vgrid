import * as React from 'react';
import {BoundingBox} from './interval';
import Spinner from './spinner';

interface ProgressiveImageProps {
  src: string,
  width: number,
  height: number
  target_width?: number,
  target_height?: number,
  crop?: BoundingBox,
  onLoad?: (() => void)
}

interface ProgressiveImageState {
  loaded: boolean
}

// ProgressiveImage displays a loading gif (the spinner) while an image is loading.
export default class ProgressiveImage extends React.Component<ProgressiveImageProps, ProgressiveImageState> {
  state = {loaded: false}

  onLoad = () => {
    this.setState({loaded: true});

    if (this.props.onLoad) {
      this.props.onLoad();
    }
  }

  onError = (e: any) => {
    console.error(`Failed to load image ${this.props.src}`, e);
  }

  componentWillReceiveProps(props: ProgressiveImageProps) {
    if (this.props.src != props.src) {
      this.setState({loaded: false});
    }
  }

  render() {
    let width = this.props.width;
    let height = this.props.height;
    let target_width = this.props.target_width;
    let target_height = this.props.target_height;
    let crop  = this.props.crop;
    let cropStyle;
    if (crop) {
      let bbox_width = crop.x2 - crop.x1;
      let bbox_height = crop.y2 - crop.y1;
      let scale =
        target_height
        ? target_height / (height * height)
        : (target_width as number) / (width * width);

      cropStyle = {
        backgroundImage: `url(${this.props.src})`,
        backgroundPosition: `-${crop.x1 * width * scale}px -${crop.y1 * height * scale}px`,
        backgroundSize: `${width * scale}px ${height * scale}px`,
        backgroundRepeat: 'no-repeat',
        width: bbox_width * width * scale,
        height: bbox_height * height * scale
      }
    } else {
      cropStyle = {};
    }
    let imgStyle = {
      display: (this.state.loaded && !crop) ? 'inline-block' : 'none',
      width: target_width ? target_width : 'auto',
      height: target_height ? target_height : 'auto'
    };
    return (
      <div>
        {this.state.loaded
         ? null
         : <Spinner width={imgStyle.width} height={imgStyle.height} />}
        <img src={this.props.src} draggable={false} onLoad={this.onLoad} onError={this.onError} style={imgStyle} />
        {crop !== null
         ? <div style={cropStyle} />
         : null}
      </div>
    );
  }
}
