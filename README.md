# VGrid: video metadata visualization in Javascript

[![Build Status](https://travis-ci.org/scanner-research/vgrid.svg?branch=master)](https://travis-ci.org/scanner-research/vgrid)

VGrid is a Javascript library for visualization spatiotemporal metadata (e.g. bounding boxes, pose keypoints) on video. We use VGrid to inspect and debug computer vision models.

VGrid is a standalone JS library so you can embed it any HTML page. See the [vgrid_jupyter](https://github.com/scanner-research/vgrid_jupyter) package for Jupyter integration.

Documentation coming soon!

## Installation

You must have [npm](https://www.npmjs.com/get-npm) installed. VGrid has `react`, `react-dom`, `mobx`, and `mobx-react` as peer dependencies, so you must have those npm packages already installed, e.g.

```
npm install --save react react-dom mobx mobx-react
```

### From npm

```
npm install --save @wcrichto/vgrid
```

### From source

```
git clone https://github.com/scanner-research/vgrid
cd vgrid
npm install
npm link @wcrichto/rekall # only if you installed rekall from source
npm run prepublishOnly
npm link
```

## Usage

This is an example that shows a block with a single interval from time 0s to 10s for a video `test.mp4`.

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
  new Table('videos', [{id: 0, path: 'test.mp4', num_frames: 1000, width: 640, height: 480, fps: 29.97}]));

// Modify display settings
let settings = {
  show_timeline: false
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
