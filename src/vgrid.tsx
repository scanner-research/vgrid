import * as React from "react";
import * as _ from 'lodash';
import {deepObserve} from 'mobx-utils';
import {Provider, observer} from 'mobx-react';

import 'main.scss';

import {VBlock} from'./vblock';
import {IntervalSet} from './interval';
import {Database} from './database';
import {default_settings} from './settings';
import {default_palette, ColorMap} from './color';
import {BlockSelectType, BlockLabelState, LabelState} from './label_state';

// Re-exports
export * from './interval';
export * from './database';
export * from './drawable';
export * from './metadata';

export interface VGridProps {
  intervals: {[key: string]: IntervalSet}[]
  database: Database
  label_callback?: (state: LabelState) => void
}

@observer
export class VGrid extends React.Component<VGridProps, {}> {
  label_state: LabelState
  color_map: ColorMap

  constructor(props: VGridProps) {
    super(props);

    this.label_state = new LabelState();
    props.intervals.forEach((_, i) => {
      this.label_state.block_labels.set(i, new BlockLabelState());
    });

    // Set a default color for each interval set
    this.color_map = {};
    _.keys(this.props.intervals[0]).forEach((k, i) => {
      this.color_map[k] = default_palette[i];
    });

    if (this.props.label_callback) {
      _.keys(this.label_state).forEach((k) => {
        // TODO: even deep observe doesn't seem to pick up on nested changes?
        deepObserve((this.label_state as any)[k], () => {
          this.props.label_callback!(this.label_state);
        });
      });
    }
  }

  on_block_selected = (block_index: number, type: BlockSelectType) => {
    let selected = this.label_state.blocks_selected;
    if (selected.has(block_index) && selected.get(block_index)! == type) {
      selected.delete(block_index);
    } else {
      selected.set(block_index, type);
    }
  }

  render() {
    let selected = this.label_state.blocks_selected;
    return <Provider
             database={this.props.database} colors={this.color_map}  settings={default_settings}>
      <div className='vgrid'>
        {this.props.intervals.map((intvls, i) =>
          <VBlock key={i} intervals={intvls}
                  on_select={(type) => this.on_block_selected(i, type)}
                  selected={selected.has(i) ? selected.get(i)! : null}
                  label_state={this.label_state.block_labels.get(i)!} />
        )}
        <div className='clearfix' />
      </div>
    </Provider>;
  }
}
