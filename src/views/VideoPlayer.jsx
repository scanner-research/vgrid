import React from 'react';
import videojs from 'video.js';
import 'videojs-markers';
import Consumer from 'utils/Consumer.jsx';
import {DataContext} from './contexts.jsx';

export default class VideoPlayer extends React.Component {
  _lastDisplayTime = -1
  _lastPlay = false

  componentDidMount() {
    let delegate = (k, f) => {
      if (f) {
        this._player.addEventListener(k, (e) => f(e, this._player));
      }
    }

    delegate('loadeddata', this.props.onLoadedData);
    delegate('seeked', this.props.onSeeked);
    delegate('timeupdate', this.props.onTimeUpdate);

    this._player.addEventListener('timeupdate', this._onTimeUpdate);

    let track = this.props.track;
    if (track) {
      this._player.currentTime = this._toSeconds(track.min_frame)
    }
  }

  _onTimeUpdate = () => {
    // Wrap around if playing in a loop
    if (this.props.loop &&
        this.props.track.max_frame !== undefined &&
        this._player.currentTime >= this._toSeconds(this.props.track.max_frame)) {
      this._player.currentTime = this._toSeconds(this.props.track.min_frame);
    }
  }

  _toSeconds = (frame) => {
    return frame / this._dataContext.tables.videos[this.props.track.video].fps;
  }

  componentDidUpdate() {
    let checkSet = (k) => {
      if (this.props[k] && this.props[k] != this._player[k]) {
        this._player[k] = this.props[k];
      }
    };

    checkSet('width');
    checkSet('height');
    checkSet('playbackRate');

    if (this.props.displayTime && this._lastDisplayTime != this.props.displayTime) {
      this._player.currentTime = this.props.displayTime;
      this._lastDisplayTime = this.props.displayTime;
    }

    if (this.props.play != this._lastPlay) {
      this._lastPlay = this.props.play;
      if (this.props.play) {
        this._player.play();
      } else {
        this._player.pause();
      }
    }
  }

  componentWillUnmount() {
    if (this._player) {
      // wcrichto 6-2-18: DO NOT call dispose like the tutorial says you should. React will get angry.
      // this._player.dispose();
    }
  }

  render() {
    return (
      <Consumer contexts={[DataContext]}>{dataContext => {
          this._dataContext = dataContext;
          return <div data-vjs-player>
            <video preload={this.props.play ? 'auto' : 'none'} autoPlay={this.props.play} controls
                   ref={n => this._player = n}>
              <source src={this.props.video} />
              {this.props.captions
               ? <track kind='captions' src={this.props.captions} srcLang='en' label='English' default />
               : null}
            </video>
          </div>;
      }}</Consumer>
    );
  }
};
