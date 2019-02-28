import {KeyMode} from './keyboard';

export interface Endpoints {
  videos: string
  subtitles: string
  frames: string
}

export interface Settings {
  spinner_dev_mode: boolean,
  endpoints: Endpoints,
  key_mode: KeyMode
}

export let default_settings = {
  spinner_dev_mode: false,
  endpoints: {
    videos: '/system_media',
    subtitles: '/api/subtitles',
    frames: '/frameserver/fetch'
  },
  key_mode: KeyMode.Standalone
};
