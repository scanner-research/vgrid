import * as React from "react";
import * as _ from 'lodash';
import {inject, observer} from 'mobx-react';

import {Interval, Domain, Bounds, IntervalSet} from './interval';
import {ColorMap} from './color';

/* The spatial overlay draws visual metadata (e.g. bounding boxes, poses) over the thumbnail or
 * video as it plays. See drawable.tsx for how each piece of metadata is individually drawn. */

interface SpatialOverlayProps {
  intervals: {[key: string]: IntervalSet},
  width: number,
  height: number,
  time: number, // just here to trigger re-render when time changes
  colors?: ColorMap
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
                   color={this.props.colors![k]} />
               : null;
        }))}
    </div>
  }
}
