import * as React from "react";
import * as _ from 'lodash';
import {observer} from 'mobx-react';

import TimeState from './time_state';
import VideoTrack from './video_track';
import {IntervalSet} from './interval';
import {KeyMode, key_dispatch, mouseover_key_listener} from './keyboard';
import {SettingsContext} from './contexts';

interface VBlockProps {
  intervals: {[key: string]: IntervalSet}
}

interface VBlockState {
  expand: boolean,
}

@mouseover_key_listener
@observer
export class VBlock extends React.Component<VBlockProps, VBlockState> {
  state = {expand: false}

  time_state: TimeState;
  settings: any;

  toggle_expand = () => {this.setState({expand: !this.state.expand});}

  key_bindings = {
    [KeyMode.Standalone]: {
      'f': this.toggle_expand
    },
    [KeyMode.Jupyter]: {
      '=': this.toggle_expand
    }
  }

  onKeyDown = (key) => {
    key_dispatch(this.settings, this.key_bindings, key);
  }

  constructor(props) {
    super(props);

    let first_time =
      _.values(props.intervals).reduce((n, is) => Math.min(n, is.intervals[0].bounds.t1), Infinity);
    this.time_state = new TimeState(first_time);
  }

  render() {
    return <div className='vblock'>
      <SettingsContext.Consumer>{(settings) => {
          this.settings = settings;
          return <VideoTrack intervals={this.props.intervals} time_state={this.time_state} expand={this.state.expand} />;
      }}</SettingsContext.Consumer>
    </div>;
  }
}
