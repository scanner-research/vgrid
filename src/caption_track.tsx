import * as React from "react";
import {IntervalSet} from './interval';
import TimeState from './time_state';
import {DbVideo} from './database';

interface CaptionTrackProps {
  intervals: IntervalSet,
  time_state: TimeState,
  video: DbVideo,
  expand: boolean,
  target_width: number,
  target_height: number
}

export default class CaptionTrack extends React.Component<CaptionTrackProps, {}> {
  render() {
    return <div>Hi</div>;
  }
}
