import {KeyMode} from './keyboard';

export interface Settings {
  spinner_dev_mode: boolean,
  key_mode: KeyMode,
  frameserver_endpoint: string,
  video_endpoint: string,
  use_frameserver: boolean,

  /* show in thumbnail mode */
  show_timeline: boolean,
  show_captions: boolean,
  show_metadata: boolean,

  /* show in expand mode */
  show_timeline_controls: boolean,

  paginate: boolean,
  blocks_per_page: number,
  caption_delimiter: string,

  vblock_constants: any,

  colors: Array<string>
}

export let default_settings = {
  spinner_dev_mode: false,
  key_mode: KeyMode.Standalone,
  frameserver_endpoint: '/frameserver/fetch',
  video_endpoint: '/videos',
  use_frameserver: false,
  show_timeline: true,
  show_captions: true,
  show_metadata: true,
  show_timeline_controls: true,
  paginate: true,
  blocks_per_page: 50,
  caption_delimiter: '>>',
  vblock_constants: {},
  colors: []
};
