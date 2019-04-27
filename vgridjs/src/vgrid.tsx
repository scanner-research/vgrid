import * as React from "react";
import * as _ from 'lodash';
import {deepObserve} from 'mobx-utils';
import {Provider, observer} from 'mobx-react';

import {VBlock, IntervalBlock} from'./vblock';
import {IntervalSet} from './interval';
import {Database} from './database';
import {default_settings, Settings} from './settings';
import {default_palette, ColorMap} from './color';
import {BlockSelectType, BlockLabelState, LabelState} from './label_state';

import 'main.scss';

// Re-exports
export * from './interval';
export * from './database';
export * from './drawable';
export * from './metadata';
export * from './label_state';
export {IntervalBlock, interval_blocks_from_json} from './vblock';

/** Top-level interface to the VGrid widget. */
export interface VGridProps {
  /** List of interval blocks to render */
  interval_blocks: IntervalBlock[]

  /** Metadata about videos and categories */
  database: Database

  /** Maximum width of the widget, defaults to parent container size */
  max_width?: number

  /** Map of partial [[Settings]] */
  settings?: {[key: string]: any}

  /** Function called whenever the user triggers a labeling action */
  label_callback?: (state: LabelState) => void
}

interface VGridState {
  container_width: number
}

/**
 * VGrid top-level React component. See [[VGridProps]] for parameters.
 * @noInheritDoc
 */
@observer
export class VGrid extends React.Component<VGridProps, VGridState> {
  state = {container_width: 10000000}

  label_state: LabelState
  color_map: ColorMap
  settings: Settings
  container: any
  resize_observer: any

  constructor(props: VGridProps) {
    super(props);

    this.label_state = new LabelState();
    props.interval_blocks.forEach((_, i) => {
      this.label_state.block_labels.set(i, new BlockLabelState());
    });

    // Set a default color for each interval set
    this.color_map = {};
    _.keys(this.props.interval_blocks[0].interval_sets).forEach((k, i) => {
      this.color_map[k] = default_palette[i];
    });

    if (this.props.label_callback) {
      // Watch changes to the label state to invoke the label_callback
      _.keys(this.label_state).forEach((k) => {
        // TODO: even deep observe doesn't seem to pick up on nested changes?
        deepObserve((this.label_state as any)[k], () => {
          this.props.label_callback!(this.label_state);
        });
      });
    }

    // Copy in any provided settings, otherwise use defaults
    this.settings = default_settings;
    if (this.props.settings) {
      _.keys(this.props.settings).forEach((k) => {
        (this.settings as any)[k] = this.props.settings![k];
      });
    }

    this.container = React.createRef();
  }

  // Handle block-level selection by updating LabelState.blocks_selected set
  on_block_selected = (block_index: number, type: BlockSelectType) => {
    let selected = this.label_state.blocks_selected;
    if (selected.has(block_index) && selected.get(block_index)! == type) {
      selected.delete(block_index);
    } else {
      selected.set(block_index, type);
    }
  }

  // Use Chrome ResizeObserver API to track container width
  // https://googlechrome.github.io/samples/resizeobserver/
  on_resize = (entries: any) => {
    this.setState({container_width: entries[0].contentRect.width});
  }

  componentDidMount() {
    this.resize_observer = new (window as any).ResizeObserver(this.on_resize);
    this.resize_observer.observe(this.container.current);
  }

  componentWillUnmount() {
    this.resize_observer.unobserve(this.container.current);
  }

  render() {
    let selected = this.label_state.blocks_selected;
    return <Provider
             database={this.props.database} colors={this.color_map} settings={default_settings}>
      <div className='vgrid' ref={this.container}>
        {this.props.interval_blocks.map((block, i) =>
          <VBlock key={i}
                  block={block}
                  on_select={(type) => this.on_block_selected(i, type)}
                  selected={selected.has(i) ? selected.get(i)! : null}
                  label_state={this.label_state.block_labels.get(i)!}
                  container_width={this.props.max_width || this.state.container_width} />
        )}
        <div className='clearfix' />
      </div>
    </Provider>;
  }
}
