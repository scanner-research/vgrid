import * as React from 'react';

import {SpatialType, DrawProps, LabelProps} from './spatial_type';
import {Interval, Bounds, BoundingBox} from '../interval';
import {Metadata_Keypoints} from '../metadata';
import {KeypointNode, KeypointEdge, Keypoints} from '../keypoints';

class KeypointsDrawView extends React.Component<DrawProps, {}> {
  render() {
    let keypoints_array: Metadata_Keypoints[] = Object.values(
      this.props.interval.data.metadata
    ).filter(m => m instanceof Metadata_Keypoints).map(
      m => m as Metadata_Keypoints
    );

    let get_point_color = (point_index: number, keypoints: Keypoints): string => {
      /* The color is the color of the first edge we find that contains the 
      point. */
      for (let edge of keypoints.edges) {
        if (edge.start == point_index || edge.end == point_index) {
          return edge.color;
        }
      }

      return this.props.color;
    }

    let svg_style = {
      width: this.props.width,
      height: this.props.height
    }

    let bbox = this.props.interval.bounds.bbox;
    let position = {
      left: bbox.x1 * this.props.width,
      top: bbox.y1 * this.props.height
    };
    let box_style = {
      width: (bbox.x2 - bbox.x1) * this.props.width,
      height: (bbox.y2 - bbox.y1) * this.props.height,
      border: `2px solid ${this.props.color}`
    };

    let circleWidth = this.props.expand ? 4 : 2;

    return <div>
      <div className='bbox-draw' style={position}>
        <div className='box-outline' style={box_style} />
      </div>
      <svg className='keypoints' style={svg_style}>
        {keypoints_array.map((metadata_kp, j) => {
            let kp: Keypoints = metadata_kp.keypoints;
            let kp_indices: Array<number> = Object.keys(kp.keypoints).map(
              (str_index) => Number(str_index)
            );

            return <g key={j}>    
              {kp_indices.filter(
                (index: number) => kp.keypoints[index].score > 0
              ).map((index: number) =>
                <circle key={index}
                        r={circleWidth}
                        cx={kp.keypoints[index].x * this.props.width}
                        cy={kp.keypoints[index].y * this.props.height}
                        stroke={get_point_color(index, kp)}
                        strokeOpacity={1}
                        strokeWidth={0}
                        fill={get_point_color(index, kp)}
                />
              )}
              {kp.edges.filter(
                (edge) => (kp.keypoints[edge.start].score > 0 &&
                  kp.keypoints[edge.end].score > 0)
              ).map((edge, j) =>
                <line key={j}
                      x1={kp.keypoints[edge.start].x * this.props.width}
                      x2={kp.keypoints[edge.end].x * this.props.width}
                      y1={kp.keypoints[edge.start].y * this.props.height}
                      y2={kp.keypoints[edge.end].y * this.props.height}
                      stroke={edge.color}
                      strokeOpacity={1}
                      strokeWidth={circleWidth / 2}
                />
              )}
            </g>
          }
        )}
      </svg>
    </div>;
  }
}

class KeypointsLabelView extends React.Component<LabelProps, {}> {
  render() { return null; }
}

export class SpatialType_Keypoints extends SpatialType {
  draw_view(): React.ComponentType<DrawProps> { return KeypointsDrawView; }
  label_view(): React.ComponentType<LabelProps> { return KeypointsLabelView; }
}
