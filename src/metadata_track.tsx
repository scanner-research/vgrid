import * as React from "react";
import * as _ from 'lodash';
import {observer} from 'mobx-react';

import {IntervalSet, Interval} from './interval';
import TimeState from './time_state';
import {DbVideo} from './database';

interface MetadataTrackProps {
  intervals: {[key: string]: IntervalSet},
  time_state: TimeState,
  video: DbVideo,
  expand: boolean,
  target_width: number,
  target_height: number
}

export let MetadataTrack: React.SFC<MetadataTrackProps> = observer((props) => {

  let metadata = _.keys(props.intervals).reduce(
    ((meta: {[key: string]: any}, k: string) =>
      _.merge(meta, props.intervals[k].to_list().reduce(
        ((meta: {[key: string]: any}, intvl: Interval) => _.merge(meta, intvl.metadata)), {}))),
    {});

  let style = {
    width: props.expand ? 100 : props.target_width,
    height: props.expand ? props.target_height : 20,
    display: metadata.length == 0 ? 'none' : 'block'
  };

  return <div className='metadata-track' style={style}>
    {_.keys(metadata).map((k) => <div className='metadata-entry' key={k}>
      <span className='metadata-key'>{k}:</span> &nbsp;
      <span className='metadata-value'>{metadata[k].toString()}</span>
    </div>)}
  </div>;
});
