/* This example shows how to display temporal data. */

import React from 'react';
import ReactDOM from 'react-dom';
import {VGrid, Table, Database, IntervalSet, Interval, Bounds, BoundingBox,
  SpatialType_Temporal} from '@wcrichto/vgrid';
import '@wcrichto/vgrid/dist/vgrid.css';

// Setup intervals
let interval_blocks = [{
  video_id: 0,
  interval_sets: [{
    name: 'test',
    interval_set: new IntervalSet([new Interval(
      new Bounds(0, 10),
      {
        spatial_type: new SpatialType_Temporal(),
        metadata: {}
      }
    )])
  }]
}];

// Associate video IDs with metadata.
// This example assumes a 1920x1080 video at 59.94 FPS, with 20,696 frames.
// You should modify it for your own examples.
let database = new Database(
  [new Table(
    'videos',
    [{id: 0, path: 'test.mp4', num_frames: 20696,
      width: 1920, height: 1080, fps: 59.94}])]);

// Global component settings
let settings = {
  video_endpoint: 'http://localhost:8000'
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

