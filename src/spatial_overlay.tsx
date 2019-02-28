import * as React from "react";
import * as _ from 'lodash';

import TimeState from './time_state';
import {Interval, Domain, Bounds, IntervalSet} from './interval';

interface SpatialOverlayProps {
  intervals: IntervalSet,
  width: number,
  height: number,
}

export class SpatialOverlay extends React.Component<SpatialOverlayProps, {}> {
  render() {
    return <div className='spatial-overlay'>{
      this.props.intervals.to_list().map((intvl, i) => {
        let View = intvl.draw_type.view();
        return View ? <View key={i} interval={intvl} width={this.props.width} height={this.props.height} /> : null;
      })
    }</div>
  }
}
