import * as React from 'react';
import {Interval} from '../interval';
import {BlockLabelState} from '../label_state';

export interface DrawProps {
  interval: Interval,
  width: number,
  height: number,
  color: string
  expand: boolean
}

export interface LabelProps {
  width: number,
  height: number,
  color: string,
  expand: boolean,
  label_state?: BlockLabelState
}

export abstract class SpatialType {
  abstract draw_view(): React.ComponentType<DrawProps> | null;
  abstract label_view(): React.ComponentType<LabelProps> | null;
}
