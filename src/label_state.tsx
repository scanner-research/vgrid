import {observable, ObservableMap, ObservableSet, toJS} from 'mobx';
import {VData, IntervalSet} from './interval';

// Indicates the kind of selection a block has
export enum BlockSelectType {
  Positive = 'Positive',
  Negative = 'Negative'
}

export class BlockLabelState {
  @observable captions_selected: ObservableSet<number> = observable.set();
  @observable new_intervals: IntervalSet = new IntervalSet([]);
}

export class LabelState {
  @observable blocks_selected: ObservableMap<number, BlockSelectType> = observable.map();
  @observable block_labels: ObservableMap<number, BlockLabelState> = observable.map();

  to_json(): any {
    return {blocks_selected: toJS(this.blocks_selected), block_labels: toJS(this.block_labels)};
  }
}
