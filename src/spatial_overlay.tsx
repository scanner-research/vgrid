import * as React from "react";
import * as _ from 'lodash';

import TimeState from './time_state';
import {Interval, Domain, Bounds, IntervalSet} from './interval';
import {ColorContext} from './contexts';
import {ColorMap} from './color';

interface SpatialOverlayProps {
  intervals: {[key: string]: IntervalSet},
  width: number,
  height: number,
}

export class SpatialOverlay extends React.Component<SpatialOverlayProps, {}> {
  render() {
    return <div className='spatial-overlay'>
      <ColorContext.Consumer>{
        (color_map: ColorMap) =>
          _.keys(this.props.intervals).map((k) =>
            this.props.intervals[k].to_list().map((intvl, i) => {
              console.log(color_map, k, color_map[k]);
              let View = intvl.draw_type.view();
              return View
                   ? <View
                       key={i} interval={intvl} width={this.props.width} height={this.props.height}
                       color={color_map[k]} />
                   : null;
            }))
      }</ColorContext.Consumer>
    </div>
  }
}
