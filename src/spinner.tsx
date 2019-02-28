import * as React from 'react';
import {SettingsContext} from './contexts';
import {observer} from 'mobx-react';

interface SpinnerProps {
  width?: number | string,
  height?: number | string
}

@observer
export default class Spinner extends React.Component<SpinnerProps, {}> {
  render() {
    return <SettingsContext.Consumer>{settingsContext => {
      let faces = [
        'dan_spinning.gif',
        'haotian_spinning.gif',
        'james_spinning.gif',
        'will_spinning.gif',
        'kayvon_spinning.gif',
        'maneesh_spinning.gif'
      ];

      let spinner = settingsContext.spinner_dev_mode
        ? faces[Math.floor(Math.random() * faces.length)]
        : 'spinner.gif';

      return (
        <div className='spinner' style={{width: this.props.width, height: this.props.height}}>
          <img
            src={`${window.location.protocol}//${window.location.hostname}/static/images/${spinner}`}
            style={{height: this.props.height}} />
        </div>
      );
    }}</SettingsContext.Consumer>;
  }
}
