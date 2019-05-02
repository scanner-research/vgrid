import * as React from "react";
import * as _ from 'lodash';
import {observer} from 'mobx-react';

import {NamedIntervalSet, Interval, IntervalSet} from './interval';
import TimeState from './time_state';
import {DbVideo} from './database';
import {Metadata_Generic} from './metadata';

interface MetadataTrackProps {
  /** Intervals at the current time. */
  intervals: NamedIntervalSet[],
  time_state: TimeState,
  video: DbVideo,
  expand: boolean,
  width: number,
  height: number
}

/**
 * Component that shows the payloads for all intervals at the current time.
 *
 * Currently this just shows payloads containing Generic metadata.
 */
export let MetadataTrack: React.SFC<MetadataTrackProps> = observer((props) => {
  // Collect all generic metadata from every current interval.
  let generic_metadata: {[key: string]: any} =
    props.intervals.reduce(
      ((meta: {[key: string]: any}, {interval_set}: {interval_set: IntervalSet}) =>
        _.merge(meta, interval_set.to_list().reduce(
          ((meta: {[key: string]: any}, intvl: Interval) =>
            _.merge(meta, _.filter(intvl.data.metadata, (v) => v instanceof Metadata_Generic))), {}))),
      {});

  let style = {
    width: props.expand ? 100 : props.width,
    height: props.expand ? props.height : 20,
    display: _.keys(generic_metadata).length == 0 ? 'none' : 'block'
  };

  return <div className='metadata-track' style={style}>
    {_.keys(generic_metadata).map((k) => <div className='metadata-entry' key={k}>
      <span className='metadata-key'>{k}:</span> &nbsp;
      <span className='metadata-value'>{JSON.stringify(generic_metadata[k].data)}</span>
    </div>)}
  </div>;
});
