import {observable} from 'mobx';

export default class TimeState {
  @observable time: number = 0;

  constructor(time) {
    this.time = time;
  }
}
