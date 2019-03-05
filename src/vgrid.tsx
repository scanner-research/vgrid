import * as React from "react";
import * as _ from 'lodash';
import {Provider} from 'mobx-react';

import 'main.scss';

import {VBlock} from'./vblock';
import {IntervalSet} from './interval';
import {Database} from './database';
import {default_settings} from './settings';
import {default_palette, ColorMap} from './color';
import {BlockSelectType} from './select_state';

// Re-exports
export * from './interval';
export * from './database';
export * from './drawable';
export * from './metadata';

export interface VGridProps {
  intervals: {[key: string]: IntervalSet}[]
  database: Database
}

interface VGridState {
}

export class VGrid extends React.Component<VGridProps, VGridState> {
  blocks_selected: {[block_index: number]: BlockSelectType}

  constructor(props: VGridProps) {
    super(props);
    this.blocks_selected = {};
  }

  on_block_selected = (block_index: number, type: BlockSelectType) => {
    if ((block_index in this.blocks_selected) && this.blocks_selected[block_index] == type) {
      delete this.blocks_selected[block_index];
    } else {
      this.blocks_selected[block_index] = type;
    }

    this.forceUpdate();
  }

  render() {
    // Set a default color for each interval set
    let color_map: ColorMap = {};
    _.keys(this.props.intervals[0]).forEach((k, i) => {
      color_map[k] = default_palette[i];
    });

    return <Provider database={this.props.database} colors={color_map} settings={default_settings}>
      <div className='vgrid'>
        {this.props.intervals.map((intvls, i) =>
          <VBlock key={i} intervals={intvls}
                  on_select={(type) => this.on_block_selected(i, type)}
                  selected={i in this.blocks_selected ? this.blocks_selected[i] : null} />
        )}
        <div className='clearfix' />
      </div>
    </Provider>;
  }
}
