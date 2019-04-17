import * as React from "react";
import * as _ from 'lodash';
import {observer} from 'mobx-react';

import {IntervalSet, Interval} from './interval';
import TimeState from './time_state';
import {DbVideo} from './database';
import {Metadata_Generic} from './metadata';

interface MetadataTrackProps {
  /** Intervals at the current time. */
  intervals: {[key: string]: IntervalSet},
  time_state: TimeState,
  video: DbVideo,
  expand: boolean,
  width: number,
  height: number
}

/**
 * Component that shows the interval metadata for all intervals at the current time.
 */
export let MetadataTrack: React.SFC<MetadataTrackProps> = observer((props) => {
  // Collect all generic metadata from every current interval.
  let generic_metadata: any = _.keys(props.intervals).reduce(
    ((meta: {[key: string]: any}, k: string) =>
      _.merge(meta, props.intervals[k].to_list().reduce(
        ((meta: {[key: string]: any}, intvl: Interval) =>
          _.merge(meta, _.filter(intvl.data.metadata, (v) => v instanceof Metadata_Generic))), {}))),
    {});

  let style = {
    width: props.expand ? 100 : props.width,
    height: props.expand ? props.height : 20,
    display: _.keys(metadata).length == 0 ? 'none' : 'block'
  };

  return <div className='metadata-track' style={style}>
    {_.keys(metadata).map((k) => <div className='metadata-entry' key={k}>
      <span className='metadata-key'>{k}:</span> &nbsp;
      <span className='metadata-value'>{metadata[k].toString()}</span>
    </div>)}
  </div>;
});
