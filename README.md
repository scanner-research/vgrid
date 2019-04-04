# VGrid: video metadata visualization in Javascript

[![Build Status](https://travis-ci.org/scanner-research/vgrid.svg?branch=master)](https://travis-ci.org/scanner-research/vgrid)

VGrid is a Javascript library for visualization spatiotemporal metadata (e.g. bounding boxes, pose keypoints) on video. We use VGrid to inspect and debug computer vision models.

VGrid is a standalone JS library so you can embed it any HTML page. See the [vgrid_jupyter](https://github.com/scanner-research/vgrid_jupyter) package for Jupyter integration.

Documentation coming soon!

## Installation

You must have [npm](https://www.npmjs.com/get-npm) installed.

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
