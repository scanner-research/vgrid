import {Settings} from './settings';

export enum KeyMode {
  Standalone = 1,
  Jupyter = 2
}

// Calls the corresponding method for a key given the current key mode
export let key_dispatch = (
  settings: Settings,
  methods: {[mode: number]: {[key: string]: () => void}},
  key: string) => {
  let mode_methods = methods[settings.key_mode];
  let key_lower = key.toLowerCase();
  if (!(key_lower in mode_methods)) {
    return null;
  }

  return mode_methods[key_lower]();
};
