import {KeyMode} from './keyboard';

export interface Settings {
  spinner_dev_mode: boolean,
  key_mode: KeyMode,
  frameserver_endpoint: string,
  use_frameserver: boolean,
  show_timeline: boolean
}

export let default_settings = {
  spinner_dev_mode: false,
  key_mode: KeyMode.Standalone,
  frameserver_endpoint: '/frameserver/fetch',
  use_frameserver: false,
  show_timeline: true
};
