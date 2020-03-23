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
  show_metadata_thumbnail_mode: boolean,

  /* show in expand mode */
  show_timeline_controls: boolean,

  paginate: boolean,
  blocks_per_page: number,
  caption_delimiter: string,

  vblock_constants: any,

  colors: Array<string>,
  positive_color: string,
  negative_color: string,
  timeline_height: number,
  timeline_height_expanded: number,

  snap_back_to_initial_time: boolean
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
  show_metadata_thumbnail_mode: false,
  show_timeline_controls: true,
  paginate: true,
  blocks_per_page: 50,
  caption_delimiter: '>>',
  vblock_constants: {},
  colors: [ "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#edc948",
    "#b07aa1", "#ff9da7", "#9c755f", "#bab0ac"],
  positive_color: "#60f14b",
  negative_color: "#fc6b81",
  timeline_height: 50,
  timeline_height_expanded: 100,
  snap_back_to_initial_time: false
};
