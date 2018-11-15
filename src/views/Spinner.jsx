import React from 'react';
import {SettingsContext, DataContext} from 'views/contexts.jsx';

export default class Spinner extends React.Component {
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

      let spinner = settingsContext.get('spinner_dev_mode')
        ? faces[Math.floor(Math.random() * faces.length)]
        : 'spinner.gif';

      return (
          <img src={`${window.location.protocol}//${window.location.hostname}/static/images/${spinner}`} />
      );
    }}</SettingsContext.Consumer>;
  }
}
