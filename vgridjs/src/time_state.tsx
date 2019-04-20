import {observable} from 'mobx';

/** The current time for a block. All tracks are synchronized to the time state. */
export default class TimeState {
  @observable time: number = 0;

  constructor(time: number) {
    this.time = time;
  }
}
