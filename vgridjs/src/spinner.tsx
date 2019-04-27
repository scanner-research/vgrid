import * as React from 'react';
import {inject} from 'mobx-react';

import {Settings} from './settings';

interface SpinnerProps {
  width: number | string | undefined,
  height: number | string | undefined,
  settings?: Settings
}

/** A silly spinner. */
@inject("settings")
export default class Spinner extends React.Component<SpinnerProps, {}> {
  render() {
    let faces = [
      'dan_spinning.gif',
      'haotian_spinning.gif',
      'james_spinning.gif',
      'will_spinning.gif',
      'kayvon_spinning.gif',
      'maneesh_spinning.gif'
    ];

    let spinner =
      this.props.settings!.spinner_dev_mode
      ? faces[Math.floor(Math.random() * faces.length)]
      : 'spinner.gif';

    // TODO: add back in silly spinners since we changed to base64

    let style = {
      width: this.props.width,
      height: this.props.height,
      backgroundSize: `auto ${this.props.height}px`
    };

    return (
      <div className='spinner' style={style} />
    );
  }
}
