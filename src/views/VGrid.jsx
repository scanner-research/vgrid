import React from 'react';

import Groups from 'views/Groups.jsx';
import {PythonContext, DataContext} from 'views/contexts.jsx';
import Provider from 'utils/Provider.jsx';

export default class VGrid extends React.Component {
  render() {
    return (
      <div className='vgrid'>
        <Provider values={[
          [DataContext, this.props.data], [PythonContext, this.props.python]]}>
          <Groups jupyter={null} settings={this.props.settings} />
        </Provider>
      </div>
    );
  }
}
