# Developing VGrid

This document describes the technologies and high-level design of VGrid to help you get started contributing features.

## Technologies

VGrid is primarily a Javascript library that can be embedded in a webpage through Jupyter or other means. We use [Typescript](https://www.typescriptlang.org) to help structure the code base with a static type system.

The UI components are built using [React](https://reactjs.org/) for separating view from state. We use [mobx](https://mobx.js.org/getting-started.html) to simplify handling of shared mutable state. We also use a system of providers/injections in [mobx-react](https://github.com/mobxjs/mobx-react#provider-and-inject) to avoid explicitly passing settings or state between every layer of components.

The stylesheets are written using [Sass](https://sass-lang.com/), which is just slightly fancier CSS (variables, nested rules, and a few other niceities).

For the build system, we use [Webpack](https://webpack.js.org/) to orchestrate the various plugins needed for Typescripts/React/so on.

## Design

First you should read through the [README](https://github.com/scanner-research/vgrid/blob/master/README.md) to understand the API design. I'll comment on a few implementation design decisions here.

### State management

The main implementation challenge is how to keep every UI component synchronized during changes of state. Here, we primarily rely on mobx to identify pieces of core shared state, like the `TimeState` in `time_state.tsx`. The `@observable time` means that if a React component reads the `time` field inside its `render` method, then the component will automatically update whenever `time` is changed.

For example, when the video is playing, it continuously updates `time` so the timeline, captions, and spatial overlay concurrently update with the video. Or if you click on the timeline to jump to a particular time, all the other components again update.

### Performance

Because we could potentially be rendering thousands or millions of objects onto the screen, it's easy to hit performance problems even in modern browsers. Some pitfalls to avoid:

* Rendering too many DOM objects, e.g. `<div>`. If there's too many (e.g. >10,000), you should use a `canvas` or something more low-level.
* Having too many listeners. If 1,000 objects are all listening to the `mousemove` event (which is fired dozens of times per second while the mouse is moving), this can severely impact performance. Try to localize these callbacks (e.g. only listen to mousemove when the mouse is hovering over your element).
* Redundant computation on re-render. A React component's render method should, in general, be "lightweight" (do little computation) since it can be called quite frequently depending on whether React thinks the component's properties might have changed. If you build a data structure or do an O(n^2) lookup in a render method, try to cache computation or build acceleration structures on component creation.

## Build infrastructure

When you're iteratively developing changes to VGrid, I recommend using the `watch` feature to automatically recompile every time the source changes.

```
npm run watch
```

## Contributing a change

Please develop in a feature branch and open a pull request if you would like to contribute a feature.
