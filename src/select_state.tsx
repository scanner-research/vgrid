import {observable} from 'mobx';

export enum BlockSelectType {
  Positive = 'Positive',
  Negative = 'Negative'
}

export default class SelectState {
  @observable selected: number[];

  constructor() {
    this.selected = [];
  }
}
