# VGrid: video metadata visualization in Javascript

[![Build Status](https://travis-ci.org/scanner-research/vgrid.svg?branch=master)](https://travis-ci.org/scanner-research/vgrid)

VGrid is a Javascript library for visualizing spatiotemporal metadata (e.g. bounding boxes, pose keypoints) on video. For example, our group uses VGrid to inspect and debug computer vision models.

VGrid is a standalone JS library, so you can embed it any web page. See the [vgrid_jupyter](https://github.com/scanner-research/vgrid_jupyter) package for Jupyter integration. VGrid also has a Python library for building visualizations and exporteing them to JSON.

* [Installation](#installation)
  * [Javascript API](#javascript-api)
  * [Python API](#python-api)
* [Usage](#example-usage)
  * [Javascript only](#javascript-only)
  * [Javascript and Python](#javascript-and-python)
* [API](#api)
  * [Interval blocks](#interval-blocks)
  * [Draw types](#draw-types)
  * [Metadata](#metadata)
  * [Labeling](#labeling)

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

## Example usage

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
intervals = IntervalSet([Interval(Bounds3D(0, 10))])
interval_map = IntervalSetMapping({video_id: iset})

vgrid_json = VideoVBlocksBuilder() \
    .add_track(VideoTrackBuilder('test', interval_map)) \
    .add_video_metadata('http://localhost:8000', [video]) \
    .build()

# Send vgrid_json to the frontend somehow
```

And Javascript:

```jsx
import ReactDOM from 'react-dom';
import {VGrid, Database, interval_blocks_from_json} from '@wcrichto/vgrid';

// Fetch the JSON somehow
fetch_json_somehow(function(vgrid_json) {
  // Convert JSON into corresponding Javascript objects
  let {interval_blocks_json, database_json} = vgrid_json;
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

## API

VGrid provides a means of visualizing spatiotemporal data on video. We represent spatiotemporal data using _intervals_ and _interval sets_ as defined in the [Rekall](https://github.com/scanner-research/rekall) library.

### Interval blocks

VGrid is a grid of _interval blocks_, where one block contains multiple sets of related intervals within a single video. For example, let's say I have four videos, and each video has three sequences, and each sequence has three interval sets (face bounding boxes, pose keypoints, and captions). That would be represented as a grid of twelve interval blocks with each block containing three interval sets.

VGrid provides a [React component](https://scanner-research.github.io/vgrid/classes/_vgrid_.vgrid.html) as shown in the examples above. The parameters are documented in the [VGridProps](https://scanner-research.github.io/vgrid/interfaces/_vblock_.intervalblock.html) type.

The first required parameter is a list of [IntervalBlock](interfaces/_vblock_.intervalblock.html) specifying the spatiotemporal metadata. Each block contains a video ID and a dictionary of [IntervalSet](/classes/_interval_.intervalset.html).

The video ID matches up with the second parameter, a [Database](/classes/_database_.database.html) containing metadata about videos and other entities referenced in the intervals. The [database module](/modules/_database_.html) documents the required fields for different tables, e.g. for [videos](/interfaces/_database_.dbvideo.html) and for [categories](/interfaces/_database_.dbcategory.html).

### Draw types

A spatiotemporal interval is a 3-dimensional rectangular prism in time and x/y of the video. See the [Rekall documentation](https://github.com/scanner-research/rekall) for an extended discussion of how to think about this data representation.

To know how to draw an interval on a video, VGrid uses intervals annotated with a [DrawType](/classes/_drawable_.drawtype.html). The default way to draw a spatiotemporal interval is with a box ([DrawType_Bbox](/classes/_drawable_.drawtype_bbox.html)) which corresponds to a rendering function for that draw type ([BoundingBoxView](/classes/_drawable_.boundingboxview.html)).

Interval annotations like draw type are contained within an interval's payload. Specifically, intervals must have a [VData](/interfaces/_interval_.vdata.html) payload type containing a draw type and a dictionary of [Metadata](/classes/_metadata_.metadata.html). For example, in Javascript, we can explicitly create such an interval like this:

```jsx
import {Interval, Bounds, DrawType_Bbox} from '@wcrichto/vgrid';

let itvl = new Interval(
  new Bounds(0, 1), // from time 0s to time 1s
  {
    draw_type: new DrawType_Bbox(),
    metadata: {}
  });
```

Similarly in the Python API:

```python
from rekall import Interval, Bounds3D
from vgrid import DrawType_Bbox

intvl = Interval(
    Bounds3D(0, 1),
    {
        'draw_type': DrawType_Bbox(),
        'metadata': {}
    }
)
```

VGrid also provides a "builder" interface in the Python API to simplify the creation of intervals. See the module comments [vblocks_builder.py](https://github.com/scanner-research/vgrid/tree/master/vgridpy/vblocks_builder.py) for documentation and examples. Currently, VGrid supports the following draw types:

#### Bounding box

[Bounding box](/classes/_drawable_.drawtype_bbox.html): draws a rectangle over a video, default for all intervals.

#### Keypoints

[Keypoints](/classes/_drawable_.drawtype_keypoints.html): draws a graph of nodes and edges over a video, useful e.g. for face or pose keypoints.

#### Captions

[Captions](/classes/_drawable_.drawtype_caption.html): shows a box of captions beneath the video, does not draw on the video.

### Metadata

Draw type describes the "core" of how an interval should be displayed, but it's also useful to have ancillary metadata about an interval. For example, an interval could be part of some category (e.g. comes from a video of type X, is an object of type Y). VGrid requires intervals to be annotated with a dictionary of [Metadata](/classes/_metadata_.metadata.html). For example:

```jsx
import {Interval, Bounds, Metadata_Generic} from '@wcrichto/vgrid';

let itvl = new Interval(
  new Bounds(0, 1), // from time 0s to time 1s
  {
    metadata: {hello: new Metadata_Generic('world')}
  });
```

When this interval is drawn, the the "hello: world" metadata will appear adjacent to the video. Currently, VGrid supports the following metadata types:

#### Generic

[Generic](/classes/_metadata_.metadata_generic.html): most basic kind of metadata. Will be shown just as a string.

#### Categorical

[Categorical](/classes/_metadata_.metadata_categorical.html): metadata that is one value of a category, e.g. object type. Category name and type must be associated with a corresponding [category table](/interfaces/_database_.dbcategory.html) in the database.

### Labeling

VGrid provides some capabilities for users to modify or create intervals. All modifications are tracked in the [LabelState](/modules/_label_state_.html), which is passed to the top-level `label_callback` whenever the label state changes. Currently, VGrid supports the following label operations:

#### Categorizing blocks

Individual interval blocks can be categorized, currently as "Positive" or "Negative" (see [LabelState.blocks_selected](https://scanner-research.github.io/vgrid/classes/_label_state_.labelstate.html#blocks_selected) and [BlockSelectType](https://scanner-research.github.io/vgrid/enums/_label_state_.blockselecttype.html)). The user labels blocks by clicking "s" or "x" while hovering over a block.

#### Creating temporal intervals

Modifying or creating individual intervals is reflected in the [BlockLabelState](https://scanner-research.github.io/vgrid/classes/_label_state_.blocklabelstate.html) (see also [LabelState.block_labels](https://scanner-research.github.io/vgrid/classes/_label_state_.labelstate.html#block_labels)). New temporal intervals (not spatial) can be created by clicking "i" while playing through a video.
