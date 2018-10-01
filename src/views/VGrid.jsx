import React from 'react';
import {observable, autorun, toJS} from 'mobx';
import {LABEL_MODES, SELECT_MODES, Groups} from 'views/Groups.jsx';
import {SettingsContext, DataContext} from 'views/contexts.jsx';
import Provider from 'utils/Provider.jsx';

let default_settings = {
  results_per_page: 50,
  annotation_opacity: 1.0,
  show_pose: true,
  show_face: true,
  show_hands: true,
  show_lr: false,
  crop_bboxes: false,
  playback_speed: 1.0,
  show_middle_frame: true,
  show_gender_as_border: true,
  show_inline_metadata: false,
  thumbnail_size: 1,
  timeline_view: true,
  timeline_range: 20,
  track_color_identity: false,
  label_mode: LABEL_MODES.DEFAULT,
  select_mode: SELECT_MODES.RANGE,
  subtitle_sidebar: true
};

export default class VGrid extends React.Component {
  componentWillMount() {
    let cached = localStorage.getItem('settingsContext');
    cached = cached !== null ? JSON.parse(cached) : {};

    _.keys(default_settings).forEach((k) => {
      if (!this.props.settings.has(k)) {
        this.props.settings.set(k, cached.hasOwnProperty(k) ? cached[k] : default_settings[k]);
      }
    });

    autorun(() => {
      localStorage.settingsContext = JSON.stringify(toJS(this.props.settings));
    });
  }

  render() {
    return (
      <div className='vgrid'>
        <Provider values={[
          [SettingsContext, this.props.settings], [DataContext, this.props.data]]}>
          <Groups onSelect={this.props.onSelect} />
        </Provider>
      </div>
    );
  }
}
