import * as React from "react";
import 'main.scss';

import {VBlock} from'./vblock';
import {IntervalSet} from './interval';
import {Database} from './database';
import {Provider, SettingsContext, DatabaseContext} from './contexts';

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
    return <div className='vgrid'>
      <Provider values={[[DatabaseContext, this.props.database]]}>
        <div className='vblock-container'>
          {this.props.intervals.map((intvls, i) => {
             return <VBlock key={i} intervals={intvls} />;
          })}
        </div>
      </Provider>
    </div>;
  }
}
