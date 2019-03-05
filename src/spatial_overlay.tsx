import * as React from "react";
import * as _ from 'lodash';
import {inject, observer} from 'mobx-react';

import TimeState from './time_state';
import {Interval, Domain, Bounds, IntervalSet} from './interval';
import {ColorMap} from './color';

/* The spatial overlay draws visual metadata (e.g. bounding boxes, poses) over the thumbnail or
 * video as it plays. See drawable.tsx for how each piece of metadata is individually drawn. */

interface SpatialOverlayProps {
  intervals: {[key: string]: IntervalSet},
  width: number,
  height: number,
  color?: ColorMap
}

@inject("colors")
@observer
export class SpatialOverlay extends React.Component<SpatialOverlayProps, {}> {
  render() {
    return <div className='spatial-overlay'>
    {_.keys(this.props.intervals).map((k) =>
      this.props.intervals[k].to_list().map((intvl, i) => {
        let View = intvl.draw_type.view();
        return View
             ? <View
                 key={i} interval={intvl} width={this.props.width} height={this.props.height}
                 color={this.props.color![k]} />
             : null;
      }))}
    </div>
  }
}
