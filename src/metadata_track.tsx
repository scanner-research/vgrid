import * as React from "react";
import * as _ from 'lodash';
import {observer} from 'mobx-react';

import {IntervalSet, Interval} from './interval';
import TimeState from './time_state';
import {DbVideo} from './database';

interface MetadataTrackProps {
  intervals: IntervalSet,
  time_state: TimeState,
  video: DbVideo,
  expand: boolean,
  target_width: number,
  target_height: number
}

export let MetadataTrack: React.SFC<MetadataTrackProps> = observer((props) => {
  let style = {
    width: props.expand ? 100 : props.target_width,
    height: props.expand ? props.target_height : 50
  };

  let metadata = props.intervals.to_list().reduce(
    ((meta: {[key: string]: any}, intvl: Interval) => _.merge(meta, intvl.metadata)), {});

  return <div className='metadata-track' style={style}>
    {_.keys(metadata).map((k) => <div key={k}>{k}: {metadata[k].toString()}</div>)}
  </div>;
});
