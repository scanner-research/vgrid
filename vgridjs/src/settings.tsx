import {KeyMode} from './keyboard';

export interface Settings {
  spinner_dev_mode: boolean,
  key_mode: KeyMode,
  frameserver_endpoint: string,
  video_endpoint: string,
  use_frameserver: boolean,
  show_timeline: boolean,
  show_captions: boolean,
  paginate: boolean,
  blocks_per_page: number
}

export let default_settings = {
  spinner_dev_mode: false,
  key_mode: KeyMode.Standalone,
  frameserver_endpoint: '/frameserver/fetch',
  video_endpoint: '/videos',
  use_frameserver: false,
  show_timeline: true,
  show_captions: true,
  paginate: true,
  blocks_per_page: 50
};
