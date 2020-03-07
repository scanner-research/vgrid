import {observable, ObservableMap, ObservableSet, toJS} from 'mobx';
import * as _ from 'lodash';

import {VData, IntervalSet} from './interval';

/** Indicates the kind of selection a block has */
export enum BlockSelectType {
  Positive = 'Positive',
  Negative = 'Negative'
}

export class BlockLabelState {
  @observable captions_selected: ObservableSet<number> = observable.set();
  @observable new_positive_intervals: IntervalSet = new IntervalSet([]);
  @observable new_negative_intervals: IntervalSet = new IntervalSet([]);
}

/** Contains all intervals added/modified by the user when interacting with VGrid */
export class LabelState {
  /** Selections of entire blocks */
  @observable blocks_selected: ObservableMap<number, BlockSelectType> = observable.map();

  /** Intervals modified within each blocks */
  @observable block_labels: ObservableMap<number, BlockLabelState> = observable.map();

  to_json(): any {
    return {
      blocks_selected: toJS(this.blocks_selected),
      block_labels: _.mapValues(this.block_labels.toJSON(), (block_label_state: BlockLabelState) => {
        return {
          captions_selected: toJS(block_label_state.captions_selected),
          new_positive_intervals: block_label_state.new_positive_intervals.to_json(),
          new_negative_intervals: block_label_state.new_negative_intervals.to_json()
        }
      })
    };
  }
}
