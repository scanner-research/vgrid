import React from 'react';
import * as Rb from 'react-bootstrap';
import _ from 'lodash';
import {observer} from 'mobx-react';
import Clip from './Clip.jsx';
import Timeline from './Timeline.jsx';
import {DataContext, SettingsContext} from './contexts.jsx';
import keyboardManager from 'utils/KeyboardManager.jsx';
import Consumer from 'utils/Consumer.jsx';
import Provider from 'utils/Provider.jsx';

export let LABEL_MODES = Object.freeze({
  DEFAULT: 0,
  SINGLE_IDENTITY: 1,
  TOPIC_SEGMENTS: 2
});

export let SELECT_MODES = Object.freeze({
  RANGE: 0,
  INDIVIDUAL: 1
});

// Displays results with basic pagination
@observer
export class Groups extends React.Component {
  state = {
    page: 0,
    selected_start: -1,
    selected_end: -1,
    selected: new Set(),
    ignored: new Set(),
    positive_ex: new Set(),
    negative_ex: new Set()
  }

  constructor() {
    super();
    document.addEventListener('keypress', this._onKeyPress);
  }

  _isSelected = (i) => {
    let select_mode = this._settingsContext.get('select_mode');
    return (select_mode == SELECT_MODES.RANGE &&
            (this.state.selected_start == i ||
             (this.state.selected_start <= i && i <= this.state.selected_end))) ||
           (select_mode == SELECT_MODES.INDIVIDUAL && this.state.selected.has(i));
  }

  _getColorClass = (i) => {
    if (this.state.ignored.has(i)) {
      return 'ignored ';
    } else if (this._isSelected(i)) {
      return 'selected ';
    } else if (this.state.positive_ex.has(i)){
      return 'positive ';
    } else if (this.state.negative_ex.has(i)){
      return 'negative ';
    }
    return '';
  }

  _onKeyPress = (e) => {
    if (keyboardManager.locked()) {
      return;
    }

    let chr = String.fromCharCode(e.which);
    if (chr == 'a') { // TODO: Jupyter Keybinding
      if (this.state.selected_start == -1) {
        return;
      }

      let green = this.state.positive_ex;
      let labeled = [];

      let select_mode = this._settingsContext.get('select_mode');
      if (select_mode == SELECT_MODES.RANGE) {
        let end = this.state.selected_end == -1 ? this.state.selected_start : this.state.selected_end;
        for (let i = this.state.selected_start; i <= end; i++) {
          if (this.state.ignored.has(i)) {
            continue;
          }

          labeled.push(this._dataContext.groups[i]);
          green.add(i);
        }
      } else if (select_mode == SELECT_MODES.INDIVDIUAL) {
        for (let i of this.state.selected) {
          labeled.push(this._dataContext.groups[i]);
          green.add(i);
        }
      }

      // TODO(wcrichto): make saving state + errors more apparent to user (without alert boxes)
      document.body.style.cursor = 'wait';
      this.props
          .onSave({groups: labeled, label_mode: this._settingsContext.get('label_mode')})
          .then(((response) => {
            if (!response.data.success) {
              console.error(response.data.error);
              alert(response.data.error);
            } else {
              console.log('Done!');
              this.setState({
                positive_ex: green,
                selected_start: -1,
                selected_end: -1,
                selected: new Set()
              });
            }
          }).bind(this), (error) => {
            console.error(error);
            alert(error);
          })
          .finally(() => {
            document.body.style.cursor = 'auto';
          });
    }
  }

  _syncSelectionsAndIgnored = () => {
    if (this.props.onSelect) {
      this.props.onSelect(Array.from(this.state.selected));
    }
    if (this.props.onIgnore) {
      this.props.onIgnore(Array.from(this.state.ignored));
    }
  }

  _onUpdateGroups = () => {
    if (this.props.onUpdateGroups) {
      this.props.onUpdateGroups(this._dataContext.groups);
    }
  }


  _onSelect = (e) => {
    let select_mode = this._settingsContext.get('select_mode');
    if (select_mode == SELECT_MODES.RANGE) {
      if (this.state.selected_start == -1){
        this.setState({
          selected_start: e
        });
      } else if (e == this.state.selected_start) {
        this.setState({
          selected_start: -1,
          selected_end: -1
        });
      } else {
        if (e < this.state.selected_start) {
          if (this.state.selected_end == -1) {
            this.setState({
              selected_end: this.state.selected_start
            });
          }
          this.setState({
            selected_start: e
          });
        } else {
          this.setState({
            selected_end: e
          });
        }
      }
    } else if (select_mode == SELECT_MODES.INDIVIDUAL) {
      if (this.state.selected.has(e)) {
        this.state.selected.delete(e);
      } else {
        this.state.selected.add(e);
        this.state.ignored.delete(e);
      }

      // Nested collection update, have to force re-render
      this.forceUpdate();
    }

    this._syncSelectionsAndIgnored();
  }

  _onSelectUpTo = (e) => {
    // Select all unselected and unignored groups up to e
    for (let i = 0; i <= e; i++) {
        if (!this.state.selected.has(i) && !this.state.ignored.has(i)) {
            this.state.selected.add(i);
        }
    }
    this.forceUpdate();
    this._syncSelectionsAndIgnored();
  }

  _onSelectPage = () => {
    let resultsPerPage = this._settingsContext.get('results_per_page');
    let minGroup = this.state.page * resultsPerPage;
    let maxGroup = Math.min(minGroup + resultsPerPage, this._dataContext.groups.length) - 1;

    var allSelected = true;
    for (let i = minGroup; i <= maxGroup; i++) {
      allSelected &= this.state.selected.has(i);
    }

    for (let i = minGroup; i <= maxGroup; i++) {
      if (allSelected) {
        this.state.selected.delete(i);
        this.state.ignored.delete(i);
      } else {
        this.state.selected.add(i);
        this.state.ignored.delete(i);
      }
    }

    this.forceUpdate();
    this._syncSelectionsAndIgnored();
  }

  _onIgnore = (e) => {
    if (this.state.ignored.has(e)) {
      this.state.ignored.delete(e);
    } else {
      this.state.ignored.add(e);
      this.state.selected.delete(e);
    }
    this.forceUpdate();
    this._syncSelectionsAndIgnored();
  }

  _onIgnorePage = () => {
    let resultsPerPage = this._settingsContext.get('results_per_page');
    let minGroup = this.state.page * resultsPerPage;
    let maxGroup = Math.min(minGroup + resultsPerPage, this._dataContext.groups.length) - 1;

    var allIgnored = true;
    for (let i = minGroup; i <= maxGroup; i++) {
       allIgnored &= this.state.ignored.has(i);
    }

    for (let i = minGroup; i <= maxGroup; i++) {
       if (allIgnored) {
         this.state.ignored.delete(i);
         this.state.selected.delete(i);
       } else {
         this.state.ignored.add(i);
         this.state.selected.delete(i);
       }
    }

    this.forceUpdate();
    this._syncSelectionsAndIgnored();
  }

  _numPages = () => {
    return Math.floor((this._dataContext.groups.length - 1) / this._settingsContext.get('results_per_page'));
  }

  _nextPage = (e) => {
    e.preventDefault();
    this.setState({page: Math.min(this.state.page + 1, this._numPages())});
  }

  _prevPage = (e) => {
    e.preventDefault();
    this.setState({page: Math.max(this.state.page - 1, 0)});
  }

  componentDidMount() {
    this._lastResult = this.props.resultNumber;
    let selected_cached = this._settingsContext.get('selected_cached');
    let ignored_cached = this._settingsContext.get('ignored_cached');
    selected_cached.forEach((i) => {
      this.state.selected.add(i);
    });
    ignored_cached.forEach((i) => {
      this.state.ignored.add(i);
    });
    this.forceUpdate();
    this._syncSelectionsAndIgnored();
  }

  componentDidUpdate() {
    if (this.props.resultNumber && this.props.resultNumber != this._lastResult) {
      this._lastResult = this.props.resultNumber;
      this.setState({
        page: 0,
        positive_ex: new Set(),
        negative_ex: new Set(),
        ignored: new Set(),
        selected_start: -1,
        selected_end: -1
      });
    }
  }

  render () {
    return (
      <Consumer contexts={[SettingsContext, DataContext]}>{(settingsContext, dataContext) => {
          this._dataContext = dataContext;
          this._settingsContext = settingsContext;

          let PageButtons = () => <div className='page-buttons'>
              <Rb.ButtonGroup>
                <Rb.Button onClick={this._prevPage}>&larr;</Rb.Button>
                <Rb.Button onClick={this._nextPage}>&rarr;</Rb.Button>
                <span key={this.state.page}>
                  <Rb.FormControl type="text" defaultValue={this.state.page + 1} onKeyPress={(e) => {
                      if (e.key === 'Enter') { this.setState({
                        page: Math.min(Math.max(parseInt(e.target.value)-1, 0), this._numPages())
                      }); }
                  }} />
                </span>
                <span className='page-count'>/ {this._numPages() + 1}</span>
              </Rb.ButtonGroup>
            </div>;

          return <div className='groups'>
            { settingsContext.get('show_paging_buttons')
              ? <PageButtons /> : null }
            <div>
              {_.range(settingsContext.get('results_per_page') * this.state.page,
                       Math.min(settingsContext.get('results_per_page') * (this.state.page + 1),
                                this._dataContext.groups.length))
                .map((i) => <Group key={i} group={this._dataContext.groups[i]} group_id={i}
                                       onSelect={this._onSelect} onIgnore={this._onIgnore}
                                       onSelectPage={this._onSelectPage} onIgnorePage={this._onIgnorePage}
                                       onSelectUpTo={this._onSelectUpTo}
                                       colorClass={this._getColorClass(i)}
                                       onUpdateGroups={this._onUpdateGroups} />)}
              <div className='clearfix' />
            </div>
            { settingsContext.get('show_paging_buttons')
              ? <PageButtons /> : null }
          </div>;
      }}</Consumer>
    );
  }
}

@observer
class Group extends React.Component {
  state = {
    expand: false
  }

  _onKeyPress = (e) => {
    if (keyboardManager.locked()) {
      return;
    }

    let useJupyterKeys = this._settingsContext.get('jupyter_keybindings');
    var expandKey, selectKey, selectPageKey, ignoreKey, ignorePageKey, selectUpToKey;
    if (useJupyterKeys) {
      expandKey = '=';
      selectKey = '[';
      selectPageKey = '{';
      selectUpToKey = '?';
      ignoreKey = ']';
      ignorePageKey = '}';
    } else {
      expandKey = 'f';
      selectKey = 's';
      selectPageKey = 'S';
      selectUpToKey = '?';
      ignoreKey = 'x';
      ignorePageKey = 'X';
    }

    let chr = String.fromCharCode(e.which);
    if (chr == expandKey) {
      // wcrichto 12-28-18: seems like when the thumbnail is resized via expansion,
      // if the mouse leaves during the resize, the onMouseLeave event isn't fired,
      // causing a bug where the keypress event is still active. This is fixed by removing
      // the keypress handler just in case.
      document.removeEventListener('keypress', this._onKeyPress);
      this.setState({expand: !this.state.expand});
    } else if (chr == selectKey) {
      this.props.onSelect(this.props.group_id);
    } else if (chr == selectPageKey) {
      this.props.onSelectPage();
    } else if (chr == ignoreKey) {
      this.props.onIgnore(this.props.group_id);
    } else if (chr == ignorePageKey) {
      this.props.onIgnorePage();
    } else if (chr == selectUpToKey) {
      this.props.onSelectUpTo(this.props.group_id);
    }
  }

  _onMouseOver = () => {
    document.addEventListener('keypress', this._onKeyPress);
  }

  _onMouseOut = () => {
    document.removeEventListener('keypress', this._onKeyPress);
  }

  componentWillUnmount() {
    document.removeEventListener('keypress', this._onKeyPress);
  }

  componentWillReceiveProps(props) {
    if (this.props.group != props.group) {
      this.setState({expand: false});
    }
  }

  render () {
    let group = this.props.group;
    return (
      <SettingsContext.Consumer>{settingsContext => {
        this._settingsContext = settingsContext;
        return <div className={'group ' + this.props.colorClass} onMouseOver={this._onMouseOver}
             onMouseLeave={this._onMouseOut}>
          {this.props.colorClass != '' ? <div className={'select-overlay ' + this.props.colorClass} /> : null}
          {settingsContext.get('timeline_view') && group.type == 'contiguous'
           ? <Timeline group={group} expand={this.state.expand}
               onUpdateGroups={this.props.onUpdateGroups}  />
           : <div className={group.type}>
             {group.label && group.label !== ''
              ? <div className='group-label'>{group.label}</div>
              : <span />}
             <div className='group-elements'>
               {group.elements.map((clip, i) =>
                 /* TODO(wcrichto): toggle labeler */
                 <div key={i} className='element'>
                   <Clip clip={clip} showMeta={true} expand={this.state.expand}
                         enableLabel={false} />
                 </div>)}
               <div className='clearfix' />
             </div>
           </div>}
        </div>;
      }}</SettingsContext.Consumer>
    );
  }
}
