import * as React from "react";
import * as _ from 'lodash';
import {inject, observer} from 'mobx-react';
import {Metadata_Categorical} from './metadata';

import {Database, DbCategory} from './database';
import {Interval, Domain, Bounds, NamedIntervalSet} from './interval';
import {ColorMap} from './color';
import {SpatialType_Bbox} from './spatial/bbox';
import {LabelProps} from './spatial/spatial_type';

interface SpatialOverlayProps {
  intervals: NamedIntervalSet[],
  width: number,
  height: number,
  time: number, // just here to trigger re-render when time changes
  expand: boolean,
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
    let BboxLabeler = (new SpatialType_Bbox(null)).label_view()!;
    let label_color = this.props.colors!['__new_intervals'];
    return <div className='spatial-overlay'>
      <div className='spatial-intervals'>
        {this.props.intervals.map(({name, interval_set}) =>
          interval_set.to_list().map((intvl, i) => {
            let View = intvl.data.spatial_type.draw_view();
            let color = this.props.colors![name];
            _.forEach(intvl.data.metadata, (meta, name) => {
              if (meta instanceof Metadata_Categorical) {
                color = this.props.database!
                            .table(meta.category_type)
                            .lookup<DbCategory>(meta.category).color;
              }
            });

            return View
                 ? <View
                     key={i} interval={intvl} expand={this.props.expand}
                     width={this.props.width} height={this.props.height}
                     color={color} time={this.props.time}/>
                 : null;
          }))}
      </div>
      <div className='spatial-labeler'>
        <BboxLabeler width={this.props.width} height={this.props.height}
                     color={label_color} time={this.props.time}
                     expand={this.props.expand} />
      </div>
    </div>
  }
}
