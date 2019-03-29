import {KeyMode} from './keyboard';

// Base URL for visual assets
export interface Endpoints {
  videos: string
  frames: string
}

export interface Settings {
  spinner_dev_mode: boolean,
  endpoints: Endpoints,
  key_mode: KeyMode,
  use_frameserver: boolean,
  show_timeline: boolean
}

export let default_settings = {
  spinner_dev_mode: false,
  endpoints: {
    videos: '/system_media',
    subtitles: '/api/subtitles',
    frames: '/frameserver/fetch'
  },
  key_mode: KeyMode.Standalone,
  use_frameserver: false,
  show_timeline: true
};
