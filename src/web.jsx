/*
 * web.jsx - Application entrypoint
 *
 * This file is called when the page is loaded. It initializes the App React view.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import _ from 'lodash';
import SearchInput from 'views/SearchInput.jsx';
import Groups from 'views/Groups.jsx';
import axios from 'axios';
import Provider from 'utils/Provider.jsx';
import {DataContext} from 'views/contexts.jsx';

// Make AJAX work with Django's CSRF protection
// https://stackoverflow.com/questions/39254562/csrf-with-django-reactredux-using-axios
axios.defaults.xsrfHeaderName = "X-CSRFToken";

@observer
export default class App extends React.Component {
  state = {
    valid: true,
    clickedBox: null,
    dataContext: null,
  }

  constructor() {
    super();

    // Hacky way for us to publicly expose a demo while reducing remote code execution risk.
    if (GLOBALS.bucket === 'esper') {
      let img = new Image();
      img.onerror = (() => this.setState({valid: false})).bind(this);
      img.src = "https://storage.cloud.google.com/esper/do_not_delete.jpg";
    }
  }

  _onSearch = (results) => {
    this.setState({dataContext: results});
  }

  _onBoxClick = (box) => {
    this.setState({clickedBox: box.id});
  }

  render() {
    if (this.state.valid) {
      return (
        <div>
          <h1>Esper</h1>
          <div className='home'>
            <Provider values={[
              [DataContext, this.state.dataContext]]}>
              <SearchInput onSearch={this._onSearch} clickedBox={this.state.clickedBox} />
              {this.state.dataContext !== null
               ? (this.state.dataContext.groups.length > 0
                ? <Groups jupyter={null} settings={{}} />
                : <div>No results matching query.</div>)
               : null}
            </Provider>
          </div>
        </div>
      );
    } else {
      return <div className='login-error'>You must be logged into a validated Google account to access Esper.</div>
    }
  }
};

ReactDOM.render(<App />, document.getElementById('app'));
