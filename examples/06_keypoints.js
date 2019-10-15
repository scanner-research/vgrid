/* This example shows how to draw keypoints.
   The example draws a pose from Openpose. */

import React from 'react';
import ReactDOM from 'react-dom';
import {VGrid, Table, Database, IntervalSet, Interval, Bounds, BoundingBox, SpatialType_Keypoints, Metadata_Keypoints, Keypoints} from '@wcrichto/vgrid';
import '@wcrichto/vgrid/dist/vgrid.css';

// this is a pose in the top left - a few joints are missing!
let openpose_output = [
  [0.22650307416915894, 0.27375876903533936, 0.3149244785308838],
  [0.22417104244232178, 0.32567211985588074, 0.3093278706073761],
  [0.20095767080783844, 0.3175240159034729, 0.27658525109291077],
  [0.17199449241161346, 0.34749752283096313, 0.2144150584936142],
  [0.20213444530963898, 0.31754812598228455, 0.17792995274066925],
  [0.24505363404750824, 0.3393658995628357, 0.2958287000656128],
  [0.0, 0.0, 0.0],
  [0.0, 0.0, 0.0],
  [0.1870177835226059, 0.4457924962043762, 0.11119991540908813],
  [0.0, 0.0, 0.0],
  [0.0, 0.0, 0.0],
  [0.21950992941856384, 0.46496498584747314, 0.09123159199953079],
  [0.0, 0.0, 0.0],
  [0.0, 0.0, 0.0],
  [0.2253301590681076, 0.2600831389427185, 0.30744627118110657],
  [0.2345585972070694, 0.26827168464660645, 0.34357455372810364],
  [0.21832072734832764, 0.271005243062973, 0.08734595775604248],
  [0.24386557936668396, 0.2819412648677826, 0.30233266949653625]
]

// Setup intervals
let interval_blocks = [{
  video_id: 0,
  interval_sets: [{
    name: 'test',
    interval_set: new IntervalSet([new Interval(
      new Bounds(0, 10, new BoundingBox(0.17199, 0.24505, 0.26008, 0.46496)),
      {
        spatial_type: new SpatialType_Keypoints(),
        metadata: {
          'pose': new Metadata_Keypoints(
            // This parses the output -- we can also parse faces and hands!
            Keypoints.from_openpose(
              openpose_output.map((tup) => {
                return { x: tup[0], y: tup[1], score: tup[2] }
              })
            )
          )
        }
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

