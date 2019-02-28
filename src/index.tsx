import * as React from "react";
import DevTools from 'mobx-react-devtools';

import {VBlock} from'./vblock';
import {IntervalSet} from './interval';
import {Database} from './database';
import {Provider, SettingsContext, DatabaseContext} from './contexts';

// Re-exports
export * from './interval';
export * from './database';

export interface VGridProps {
  intervals: {[key: string]: IntervalSet}[],
  database: Database
}

export class VGrid extends React.Component<VGridProps, {}> {
  render() {
    return <div className='vgrid'>
      <DevTools />
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
