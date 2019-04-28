import * as React from "react";
import * as _ from 'lodash';
import {inject, observer} from 'mobx-react';
import {Metadata_Categorical} from './metadata';

import {Database, DbCategory} from './database';
import {Interval, Domain, Bounds, IntervalSet} from './interval';
import {ColorMap} from './color';
import {SpatialType_Bbox} from './spatial/bbox';
import {LabelProps} from './spatial/spatial_type';

interface SpatialOverlayProps {
  intervals: {[key: string]: IntervalSet},
  width: number,
  height: number,
  time: number, // just here to trigger re-render when time changes
  colors?: ColorMap
  database?: Database
}

/**
 * The spatial overlay draws visual metadata (e.g. bounding boxes, poses) over the thumbnail or
 * video as it plays. See the spatial/ directory for how each kind of data is drawn.
 */
@inject("database")
@inject("colors")
@observer
export class SpatialOverlay extends React.Component<SpatialOverlayProps, {}> {
  render() {
    let BboxLabeler = (new SpatialType_Bbox()).label_view()!;
    let label_color = this.props.colors!['__new_intervals'];
    return <div className='spatial-overlay'>
      <div className='spatial-intervals'>
        {_.keys(this.props.intervals).map((k) =>
          this.props.intervals[k].to_list().map((intvl, i) => {
            let View = intvl.data.spatial_type.draw_view();
            let color = this.props.colors![k];
            _.forEach(intvl.data.metadata, (meta, name) => {
              if (meta instanceof Metadata_Categorical) {
                color = this.props.database!
                            .table(meta.category_type)
                            .lookup<DbCategory>(meta.category).color;
              }
            });

            return View
                 ? <View
                     key={i} interval={intvl} width={this.props.width} height={this.props.height}
                     color={color} />
                 : null;
          }))}
      </div>
      <div className='spatial-labeler'>
        <BboxLabeler width={this.props.width} height={this.props.height} color={label_color} />
      </div>
    </div>
  }
}
