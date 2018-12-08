import React from 'react';
import {boundingRect} from './Frame.jsx';
import Clip from './Clip.jsx';
import {observer, inject} from 'mobx-react';
import {toJS} from 'mobx';
import keyboardManager from 'utils/KeyboardManager.jsx';
import Consumer from 'utils/Consumer.jsx';
import {SettingsContext, DataContext} from './contexts.jsx';
import Select from './Select.jsx';
import {PALETTE} from 'utils/Color.jsx';

let gender_colors = {'M': '#50c9f8', 'F': '#ff6d86', 'U': '#c0ff00'};

@observer
class Marker extends React.Component {
  render() {
    return <Consumer contexts={[SettingsContext]}>{ settingsContext => {
        let {t, w, h, mw, mh, mf, label, type, color, video, nframes, ..._} = this.props;
        let range = settingsContext.get('timeline_range');
        let time_to_x = (t) => t * video.fps / nframes;
        let x = time_to_x(t);
        let margin = mw;
        if (0 <= x && x <= w) {
          if (type == 'open') {
            let points = `${mw*2},${margin} 0,${margin} 0,${mh-2*margin} ${mw*2},${mh-2*margin}`;
            return (<g transform={`translate(${x}, 0)`}>
              <polyline fill="none" stroke={color} strokeWidth={mw} points={points} />
              <text x={mw+4} y={h/2} alignmentBaseline="middle" fontSize={mf}>{label}</text>
            </g>);
          } else {
            let points = `${-mw*2},${margin} 0,${margin} 0,${mh-2*margin} ${-mw*2},${mh-2*margin}`;
            return (<g transform={`translate(${x}, 0)`}>
              <polyline fill="none" stroke={color} strokeWidth={mw} points={points} />
              <text x={-(mw+4)} y={h/2} alignmentBaseline="middle" textAnchor="end" fontSize={mf}>{label}</text>
            </g>);
          }
        } else {
          return <g />;
        }
    }}</Consumer>
  }
}

@observer
class Track extends React.Component {
  _mouseX = -1
  _mouseY = -1

  _onKeyPress = (e) => {
    if (keyboardManager.locked()) {
      return;
    }

    let rect = boundingRect(this._g);
    let [x, y] = this._localCoords();
    if (!(0 <= x && x <= rect.width && 0 <= y && y <= rect.height)) {
      return;
    }

    e.preventDefault();

    let chr = String.fromCharCode(e.which);
    this.props.onKeyPress(chr, this.props.i);
  }

  _onMouseMove = (e) => {
    this._mouseX = e.clientX;
    this._mouseY = e.clientY;
  }

  _localCoords = (e) => {
    let rect = boundingRect(this._g);
    return [this._mouseX - rect.left, this._mouseY - rect.top];
  }

  _onDeleteLabel = (i) => {
    this.props.track.topics.splice(i, 1);
  }

  componentDidMount() {
    document.addEventListener('keypress', this._onKeyPress);
    document.addEventListener('mousemove', this._onMouseMove);
  }

  componentWillUnmount() {
    document.removeEventListener('keypress', this._onKeyPress);
    document.removeEventListener('mousemove', this._onMouseMove);
  }

  render() {
    // TODO: show topics on current track if out of sight
    return <Consumer contexts={[SettingsContext, DataContext]} >{(settingsContext, dataContext) => {
        let {track, segment_index, color, w, h, mw, mh, mf, video, nframes, ..._} = this.props;
        //let start = track.min_frame / video.fps;
        //let end = track.max_frame / video.fps;

        //let range = settingsContext.get('timeline_range');
        //let time_to_x = (t) => w/2 + (t - this.props.currentTime) / (range/2) * w/2;
        let x1 = track.min_frame / nframes * w;
        let x2 = track.max_frame / nframes * w;

        if (track.gender_id !== undefined) {
          color = gender_colors[dataContext.categories.genders[track.gender_id].name];
        } else if (track.identity !== undefined) {
          let ident_colors = PALETTE;
          color = ident_colors[track.identity % ident_colors.length];
        }

        let texts = [];
        if (track.identity !== undefined) {
          texts = [track.identity];
        } else if (track.topics !== undefined) {
          texts = track.topics.map((id) => this._dataContext.categories.topics[id]);
        }

        let y_start = segment_index * h;

        return (
          <g ref={(n) => {this._g = n;}}>
            <rect x={x1} width={x2-x1} y={y_start} height={h} opacity = {0.5} fill={color} />
             <g>
               <foreignObject x={x1+2} y={y_start} width={1000} height={h}>
                 <div className='track-label-container' xmlns="http://www.w3.org/1999/xhtml">
                   {texts.map((text, i) =>
                     <div key={i} className='track-label'>
                       <span>{text}</span>
                       <span className="oi oi-x" onClick={() => this._onDeleteLabel(i)}></span>
                     </div>
                   )}
                 </div>
               </foreignObject>
             </g>
          </g>
        );
    }}</Consumer>;
  }
}


@observer
export default class Timeline extends React.Component {
  state = {
    currentTime: 0,
    clickedTime: -1,
    displayTime: -1,
    displayFrame: -1,
    startX: -1,
    startY: -1,
    trackStart: -1,
    moused: false,
    showSelect: false,
    clipWidth: null
  }

  _videoPlaying = false;
  _lastPlaybackSpeed = null;
  _undoStack = [];

  _onTimeUpdate = (t) => {
    if (t != this.state.currentTime) {
      this.setState({currentTime: t});
    }
  }

  _localCoords = (e) => {
    let rect = boundingRect(this._svg);
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  //  _onMouseDown = (e) => {
  //    let [x, y] = this._localCoords(e);
  //    this.setState({startX: x, startY: y, clickedTime: this.state.currentTime});
  //  }
  //
  //  _onMouseMove = (e) => {
  //    if (this.state.startX != -1) {
  //      let [x, y] = this._localCoords(e);
  //      let dx = x - this.state.startX;
  //      let dt = this._settingsContext.get('timeline_range') * dx / boundingRect(this._svg).width * -1;
  //      this.setState({
  //        displayTime: this.state.clickedTime + dt,
  //        currentTime: this.state.clickedTime + dt
  //      });
  //    }
  //  }
  //
  //  _onMouseUp = (e) => {
  //    this.setState({startX: -1, startY: -1});
  //  }

  _onClick = (e) => {
    let [x, y] = this._localCoords(e);
    let video = this._video();
    let vid_height = this.props.expand ? video.height : 100 * this._settingsContext.get('thumbnail_size');
    let vid_width = video.width * vid_height / video.height;
    let width = this.state.clipWidth !== null && this.props.expand ? this.state.clipWidth : vid_width;
    let newTime = (x / width) * (video.num_frames / video.fps);
    this.setState({
      currentTime: newTime,
      displayTime: newTime,
      displayFrame: Math.round(newTime * video.fps)
    });
  }

  _timelineOnMouseOut = (e) => {
    if (this.state.startX != -1) {
      this.setState({startX: -1, startY: -1});
    }
  }

  _video = () => {
    return this._dataContext.tables.videos[this.props.group.elements[0].video];
  }

  _pushState = () => {
    this._undoStack.push(_.cloneDeep(toJS(this.props.group.elements)));

    // Keep the stack small to avoid using too much memory
    let MAX_UNDO_STACK_SIZE = 10;
    if (this._undoStack.length > MAX_UNDO_STACK_SIZE) {
      this._undoStack.shift();
    }
  }

  _onTrackKeyPress = (chr, i) => {
    // Change track gender
    if (chr == 'g') {
      this._pushState();
      let track = this.props.group.elements[i];
      let keys = _.sortBy(_.map(_.keys(this._dataContext.categories.genders), (x) => parseInt(x)));
      track.gender_id = keys[(_.indexOf(keys, track.gender_id) + 1) % keys.length];
    }

    // Merge track
    else if (chr == 'm') {
      this._pushState();
      this.props.group.elements[i-1].max_frame = this.props.group.elements[i].max_frame;
      this.props.group.elements.splice(i, 1);
    }

    else if (chr == 'n') {
      this._pushState();
      let track = this.props.group.elements[i];
      let new_track = _.cloneDeep(toJS(track));

      let fps = this._video().fps;
      let frame = Math.round(this.state.currentTime * fps);
      track.max_frame = frame;
      new_track.min_frame = frame;
      new_track.topics = [];

      this.props.group.elements.splice(i+1, 0, new_track);
    }

    // Delete track
    else if (chr == 'd') {
      this._pushState();
      this.props.group.elements.splice(i, 1);
    }

    // Change track topic
    else if (chr == 't') {
      this.setState({showSelect: true});
    }

    this.forceUpdate();
  }

  _onSelect = (value) => {
    let fps = this._video().fps;
    let curFrame = this.state.currentTime * fps;
    let curTrack = this.props.group.elements.map((clip, i) => [clip, i]).filter(([clip, _]) =>
      clip.min_frame <= curFrame && curFrame <= clip.max_frame)[0][1];

    // valueKey is set if sent as a new option, value is set otherwise
    value = value.map(opt => ({k: parseInt(opt.valueKey || opt.value), v: opt.label}));
    let toSave = value.filter(opt => opt.k == -1).map(opt => opt.v);

    // TODO(wcrichto): fix topic save implementation
    console.alert('Creating topics needs to get implemented')
    this.setState({showSelect: false});

    /* let promise = toSave.length > 0
     *             ? axios.post('/api/newthings', {things: toSave}).then((response) => {
     *               console.log(response.data);
     *               if (!response.data.success) {
     *                 alert(response.data.error);
     *                 return [];
     *               }

     *               console.log(response.data);
     *               let newthings = response.data.newthings;
     *               newthings.forEach(thing => {
     *                 this._dataContext.categories.topics
     *                 this._backendSettings.things[thing.type][thing.id] = thing.name;
     *                 this._backendSettings.things_flat[thing.id] = thing.name;
     *               });
     *               return newthings.map(thing => ({k: thing.id, v: thing.name}));
     *             })
     *             : Promise.resolve([]);

     * promise.then(newopts => {
     *   let newvalues = value.filter(opt => opt.k != -1).concat(newopts);

     *   let track = this.props.group.elements[curTrack];
     *   if (!track.topics) { track.topics = []; }
     *   newvalues.forEach(opt => {track.topics.push(opt.k);});

     *   this.setState({showSelect: false});
     * });*/
  }

  _onKeyPress = (e) => {
    if (keyboardManager.locked() || !(this._videoPlaying || this.state.moused)) {
      return;
    }

    let chr = String.fromCharCode(e.which);

    let fps = this._video().fps;
    let curFrame = this.state.currentTime * fps;

    let elements = this.props.group.elements;
    if (chr == '\r') {
      let lastTrack = elements.map((clip, i) => [clip, i]).filter(([clip, _]) =>
        clip.min_frame <= curFrame);
      let offset = e.shiftKey ? -1 : 1;
      let index = lastTrack[lastTrack.length - 1][1] + offset;
      if (0 <= index && index < elements.length) {
        let newTime = elements[index].min_frame / fps + 0.1;
        this.setState({
          displayTime: newTime,
          currentTime: newTime
        });
      }
    }

    else if (chr == 'r') {
      let playbackSpeed = this._settingsContext.get('playback_speed');
      if (playbackSpeed != 1) {
        this._settingsContext.set('playback_speed', 1);
        this._lastPlaybackSpeed = playbackSpeed;
      } else {
        this._settingsContext.set('playback_speed', this._lastPlaybackSpeed);
      }
    }

    else if (chr == 'i') {
      if (this.state.trackStart == -1) {
        this.setState({trackStart: this.state.currentTime});
      } else {
        this._pushState();

        let start = Math.round(this.state.trackStart * fps);
        let end = Math.round(this.state.currentTime * fps);

        let to_add = [];
        let to_delete = [];
        elements.map((clip, i) => {
          // +++ is the new clip, --- is old clip, overlap prioritized to new clip

          // [---[++]+++]
          if (clip.min_frame <= start && start <= clip.max_frame && clip.max_frame <= end) {
            clip.max_frame = start;
          }

          // [+++[+++]---]
          else if(start <= clip.min_frame && clip.min_frame <= end && end <= clip.max_frame){
            clip.min_frame = end;
          }

          // [---[+++]---]
          else if (clip.min_frame <= start && end <= clip.max_frame) {
            let new_clip = _.cloneDeep(clip);
            new_clip.min_frame = end;
            clip.max_frame = start;
            to_add.push(new_clip);
          }

          // [+++[+++]+++]
          else if (start <= clip.min_frame && clip.max_frame <= end) {
            to_delete.push(i);
          }
        });

        _.reverse(to_delete);
        to_delete.map((i) => elements.splice(i, -1));
        elements.push.apply(elements, to_add);
        elements.push({
          video: elements[0].video,
          min_frame: start,
          max_frame: end,
          // TODO(wcrichto): how to define reasonable defaults when labeling different kinds of
          // tracks?
          //gender_id: _.find(this._dataContext.genders, (l) => l.name == 'M').id
        });
        this.props.group.elements = _.sortBy(elements, ['min_frame']);

        this.setState({trackStart: -1});
      }
    }

    else if (chr == 'z') {
      if (this._undoStack.length > 0) {
        let lastState = this._undoStack.pop();
        this.props.group.elements = lastState;
      }
    }

    else {
      let curTracks = this.props.group.elements.map((clip, i) => [clip, i]).filter(([clip, _]) =>
        clip.min_frame <= curFrame && curFrame <= clip.max_frame);
      if (curTracks.length == 0) {
        console.warn('No tracks to process');
      } else if (curTracks.length > 1) {
        console.error('Attempting to process multiple tracks', curTracks);
      } else {
        let chr = String.fromCharCode(e.which);
        this._onTrackKeyPress(chr, curTracks[0][1]);
      }
    }
  }

  _containerOnMouseOver = () => {
    this.setState({moused: true});
  }

  _containerOnMouseOut = () => {
    this.setState({moused: false});
  }

  componentDidMount() {
    document.addEventListener('keypress', this._onKeyPress);
    let min_frame = this.props.group.elements[0].segments.length > 0
      ? this.props.group.elements[0].segments[0].min_frame
      : 0;
    this.setState({
      currentTime: min_frame / this._video().fps
    })
  }

  componentWillUnmount() {
    document.removeEventListener('keypress', this._onKeyPress);
  }

  componentDidUpdate() {
    let width = this._clip.width();
    if (width != this.state.clipWidth) {
      this.setState({clipWidth: width});
    }
  }

  // TODO(wcrichto): timeline disappears after deleting first track in the timeline

  render() {
    return <Consumer contexts={[SettingsContext, DataContext]}>{(settingsContext, dataContext) => {
        this._settingsContext = settingsContext;
        this._dataContext = dataContext;

        if (this._lastPlaybackSpeed === null) {
          this._lastPlaybackSpeed = this._settingsContext.get('playback_speed');
        }

        let group = this.props.group;
        let expand = this.props.expand;

        console.assert(group.elements.length > 0);
        // try to show the min frame and max frame of the first segment in the
        // first list of segments
        let clip = {
          video: group.label,
          min_frame: group.elements[0].segments.length > 0
            ? Math.round(group.elements[0].segments[0].min_frame)
            : 0,
          max_frame: group.elements[0].segments.length > 0
            ? Math.round(group.elements[0].segments[group.elements[0].segments.length - 1].max_frame)
            : group.num_frames
        };
        if (this.state.displayFrame == -1) {
          clip.display_frame = this._settingsContext.get('show_middle_frame')
              ? (group.elements[0].segments.length > 0
                  ? Math.round((group.elements[0].segments[0].max_frame + clip.min_frame) / 2)
                  : Math.round((clip.max_frame + clip.min_frame) / 2))
              : clip.min_frame;
        } else {
          clip.display_frame = this.state.displayFrame;
        }

        let video = this._video();
        let vid_height = expand ? video.height : 100 * this._settingsContext.get('thumbnail_size');
        let vid_width = video.width * vid_height / video.height;

        let num_timelines = group.elements.length;
        let track_height = expand ? 12 : 4;
        let timeboxStyle = {
          width: this.state.clipWidth !== null && expand ? this.state.clipWidth : vid_width,
          height: Math.max(num_timelines * track_height, expand ? 60 : 20)
        };

        let containerStyle = {
          width: vid_width,
          height: vid_height + timeboxStyle.height
        };

        let tprops = {
          w: timeboxStyle.width,
          h: track_height,
          mw: expand ? 2 : 1,
          mh: timeboxStyle.height,
          mf: expand ? 16 : 12,
          currentTime: this.state.currentTime,
          video: video,
          nframes: group.num_frames,
        };

        let selectWidth = 300;
        let selectStyle = {
          left: timeboxStyle.width / 2 - selectWidth / 2,
          top: vid_height,
          position: 'absolute',
          zIndex: 1000
        };

        let all_segments = []
        group.elements.forEach((segmentlist, segment_index) =>
          segmentlist.segments.forEach((segment, i, arr) => {
            arr[i].segment_index = segment_index;
            arr[i].color = segmentlist.color;
            all_segments.push(arr[i]);
          })); 

        return <div className={'timeline ' + (this.props.expand ? 'expanded' : '')}
                    onMouseOver={this._containerOnMouseOver} onMouseOut={this._containerOnMouseOut}>
          <div className='column'>
            <Clip clip={clip} onTimeUpdate={this._onTimeUpdate} showMeta={false}
                      expand={this.props.expand} displayTime={this.state.displayTime}
                      ref={(n) => {this._clip = n;}} />
            <svg className='time-container' style={timeboxStyle}
                 onClick={this._onClick}
                 ref={(n) => {this._svg = n;}}>
              <g>{all_segments.map((segment, i) =>
                  // We destructure the track b/c mobx doesn't seem to be observing updates to it?
                  <Track key={i} i={i} track={segment}
                    segment_index = {segment.segment_index}
                    color = {segment.color}
                    onKeyPress={this._onTrackKeyPress} {...tprops} />)}
              </g>
              {this.state.trackStart != -1
               ? <Marker t={this.state.trackStart} type="open" color="rgb(230, 230, 20)" {...tprops} />
               : <g />}
               <line
                   x1={tprops.currentTime * tprops.video.fps * tprops.w / tprops.nframes}
                   x2={tprops.currentTime * tprops.video.fps * tprops.w / tprops.nframes}
                   y1={0} y2={timeboxStyle.height} stroke="rgb(20, 230, 20)" strokeWidth={tprops.mw} />
            </svg>
            {this.state.showSelect
             ? <div style={selectStyle}>
               <Select
                 data={_.sortBy(_.map(this._dataContext.categories.topics, (v, k) => [k, v]), [1])}
                 multi={true}
                 width={selectWidth}
                 creatable={true}
                 onSelect={this._onSelect}
                 onClose={() => {this.setState({showSelect: false});}}
               />
             </div>
             : null}
          </div>
        </div>;
    }}</Consumer>
  }
}
