# VGrid: video metadata visualization in Javascript

[![Build Status](https://travis-ci.org/scanner-research/vgrid.svg?branch=master)](https://travis-ci.org/scanner-research/vgrid)

VGrid is a Javascript library for visualization spatiotemporal metadata (e.g. bounding boxes, pose keypoints) on video. We use VGrid to inspect and debug computer vision models.

VGrid is a standalone JS library so you can embed it any HTML page. See the [vgrid_jupyter](https://github.com/scanner-research/vgrid_jupyter) package for Jupyter integration.

VGrid also has a Python library for building visualizations and exporting them to json.

## Installation

VGrid has two API components: the main (required) Javascript API for rendering the visualizing component, and an (optional) Python API for creating VGrid inputs. The Python API is useful if you have a Jupyter notebook or a Python server with VGrid on the frontend.

### Javascript API

VGrid must be installed in the context of a Javascript application using the [npm package structure](https://docs.npmjs.com/about-packages-and-modules). You must have  [npm](https://www.npmjs.com/get-npm) installed. VGrid has `react`, `react-dom`, `mobx`, and `mobx-react` as peer dependencies, so you must have those npm packages already installed in your Javascript application, e.g.

```
npm install --save react react-dom mobx mobx-react
```

You can install VGrid either through npm or from source.

#### From npm

```
npm install --save @wcrichto/vgrid
```

#### From source

First, install `vgrid` to your system:

```
git clone https://github.com/scanner-research/vgrid
cd vgrid/vgridjs
npm install
npm link @wcrichto/rekall # only if you installed rekall from source
npm run prepublishOnly
npm link
```

Then inside your JS application, link in `vgrid`:

```
cd your_app
npm link @wcrichto/vgrid
```

### Python API

VGrid requires Python 3.5 or greater.

#### From pip

```
pip3 install vgridpy
```

#### From source

```
git clone https://github.com/scanner-research/vgrid
cd vgrid/vgridpy
pip3 install -e .
```

## Usage

Assume you have a video `test.mp4` in your current directory. This is an example that shows a block with a single interval from time 0s to 10s for the video. First, you need to launch a local file server that can serve the video file to a webpage. For example, you can launch a server in the same directory as `test.mp4` on port 8000 by running:

```
python3 -m http.server
```

### Javascript only

If you're only running Javascript, then you will need to construct the video metadata and interval data using the Javascript API.

```jsx
import ReactDOM from 'react-dom';
import {VGrid, Database, IntervalSet, Interval, Bounds} from '@wcrichto/vgrid';

// Setup intervals
let interval_blocks = {
  video_id: 0,
  interval_sets: {
    test: new IntervalSet([new Interval(new Bounds(0, 10))])
  }
};

// Associate video IDs with metadata
let database = new Database(
  new Table(
    'videos',
    [{id: 0, path: 'http://localhost:8000/test.mp4', num_frames: 1000,
      width: 640, height: 480, fps: 29.97}]));

// Global component settings
let settings = {
  show_timeline: true
};

// Run code when user provides labeling input
let label_callback = (label_state) => {
  console.log(label_state.blocks_selected);
};

// Render React component into a <div id="#vgrid"></div>
ReactDOM.render(
  <VGrid interval_blocks={interval_blocks} database={database}
         settings={settings} label_callback={label_callback} />,
  document.getElementById('vgrid'));
```

### Javascript and Python

You can use the Python API to build the video metadata and interval data, then send the JSON string to the frontend. Python:

```python
from rekall import Interval, IntervalSet, IntervalSetMapping
from rekall.bounds import Bounds3D
from vgrid import VideoVBlocksBuilder, VideoTrackBuilder, VideoMetadat

video_id = 1
video = VideoMetadata(path='test.mp4', id=video_id)
intervals = IntervalSet([Interval(Bounds3D(0, 10)), Interval(Bounds3D(20, 30))])
interval_map = IntervalSetMapping({video_id: iset})

interval_blocks_json = VideoVBlocksBuilder() \
    .add_track(VideoTrackBuilder('test', interval_map)) \
    .add_video_metadata('http://localhost:8000', [video]) \
    .build()

# Send interval_blocks_json to the frontend
```

And Javascript:

```javascript
import ReactDOM from 'react-dom';
import {VGrid, Database, interval_blocks_from_json} from '@wcrichto/vgrid';

// Fetch the JSON somehow
get_json(function(json) {
  // Convert JSON into corresponding Javascript objects
  let {interval_blocks_json, database_json} = json;
  let database = Database.from_json(database_json);
  this.interval_blocks = interval_blocks_from_json(interval_blocks_json);

  // Global component settings
  let settings = {
    show_timeline: true
  };

  // Run code when user provides labeling input
  let label_callback = (label_state) => {
    console.log(label_state.blocks_selected);
  };

  // Render React component into a <div id="#vgrid"></div>
  ReactDOM.render(
    <VGrid interval_blocks={interval_blocks} database={database}
           settings={settings} label_callback={label_callback} />,
    document.getElementById('vgrid'));
});
```
