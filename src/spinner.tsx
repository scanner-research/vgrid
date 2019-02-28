import * as React from 'react';
import {SettingsContext} from './contexts';
import {observer} from 'mobx-react';

interface SpinnerProps {
  width?: number,
  height?: number
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
          <img src={`${window.location.protocol}//${window.location.hostname}/static/images/${spinner}`}
               {...this.props} />
      );
    }}</SettingsContext.Consumer>;
  }
}
