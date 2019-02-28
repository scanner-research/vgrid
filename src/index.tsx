import * as React from "react";
import * as _ from 'lodash';

import 'main.scss';

import {VBlock} from'./vblock';
import {IntervalSet} from './interval';
import {Database} from './database';
import {Provider, SettingsContext, DatabaseContext, ColorContext} from './contexts';
import {default_palette, ColorMap} from './color';

// Re-exports
export * from './interval';
export * from './database';
export * from './drawable';

export interface VGridProps {
  intervals: {[key: string]: IntervalSet}[],
  database: Database
}

export class VGrid extends React.Component<VGridProps, {}> {
  render() {
    // Set a default color for each interval set
    let color_map: ColorMap = {};
    _.keys(this.props.intervals[0]).forEach((k, i) => {
      color_map[k] = default_palette[i];
    });

    return <div className='vgrid'>
      <Provider values={[[DatabaseContext, this.props.database], [ColorContext, color_map]]}>
        <div className='vblock-container'>
          {this.props.intervals.map((intvls, i) => {
             return <VBlock key={i} intervals={intvls} />;
          })}
          <div className='clearfix' />
        </div>
      </Provider>
    </div>;
  }
}
