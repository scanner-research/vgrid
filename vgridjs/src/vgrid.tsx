import * as React from "react";
import * as _ from 'lodash';
import {autorun} from 'mobx';
import {Provider, observer} from 'mobx-react';

import {VBlock, IntervalBlock} from'./vblock';
import {IntervalSet} from './interval';
import {Database} from './database';
import {default_settings, Settings} from './settings';
import {default_palette, ColorMap} from './color';
import {BlockSelectType, BlockLabelState, LabelState} from './label_state';
import {ActionStack} from './undo';
import {mouse_key_events} from './events';
import {BlockPagination} from './pagination';

import 'main.scss';

// Re-exports
export * from './interval';
export * from './database';
export * from './spatial/mod';
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
  expand_num: number
}

/**
 * VGrid top-level React component. See [[VGridProps]] for parameters.
 * @noInheritDoc
 */
@mouse_key_events
@observer
export class VGrid extends React.Component<VGridProps, VGridState> {
  state = {container_width: 10000000, expand_num: -1}

  action_stack: ActionStack
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
    this.color_map = {'__new_intervals': default_palette[default_palette.length - 1]};
    this.props.interval_blocks[0].interval_sets.forEach(({name}, i) => {
      this.color_map[name] = default_palette[i];
    });

    if (this.props.label_callback) {
      // Watch changes to the label state to invoke the label_callback
      autorun(_ => {
        this.label_state.block_labels.forEach((block_state) => {
          block_state.new_intervals.length();
        });
        this.props.label_callback!(this.label_state);
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

    this.action_stack = new ActionStack();
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

  onKeyUp = (key: string) => {
    if (key == 'z') {
      this.action_stack.undo();
    } else if (key == 'y') {
      this.action_stack.redo();
    }
  }

  onChildExpand = (id: number) => {
    // console.log("EXPAND", id);
    if (this.state.expand_num == id)
      this.setState({expand_num: -1});
    else
      this.setState({expand_num: id});
  }

  render() {
    let selected = this.label_state.blocks_selected;
    return <Provider
             database={this.props.database} colors={this.color_map} settings={default_settings}
             action_stack={this.action_stack} >
        <div className='vgrid' ref={this.container}>
            <BlockPagination blocks={this.props.interval_blocks.map((block, i) =>
              <li style={{display: "inline-block", verticalAlign: "top"}}>
                  <VBlock key={i}
                              block={block}
                              on_select={(type) => this.on_block_selected(i, type)}
                              selected={selected.has(i) ? selected.get(i)! : null}
                              label_state={this.label_state.block_labels.get(i)!}
                              container_width={this.props.max_width || this.state.container_width}
                              expand={i == this.state.expand_num }
                          onExpand = {() => this.onChildExpand(i)} />
              </li>
            )} />
        </div>
    </Provider>;
  }
}
