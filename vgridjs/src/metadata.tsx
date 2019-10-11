/**
 * Metadata classes are used to represent structured payloads for Rekall intervals. Each kind of
 * metadata is drawn differently in the interface.
 */

import {KeypointNode, KeypointEdge, Keypoints} from './keypoints'

export abstract class Metadata {}

/**
 * Simple metadata for indicating that an interval should be visually flagged. Useful for
 * labeling or any kind of lightweight mark that isn't a categorical.
 */
export class Metadata_Flag extends Metadata {
  static from_json(obj: any): Metadata_Flag {
    return new Metadata_Flag();
  }
}

/**
 * The most generic kind of metadata, i.e. it has no particular structure that can be
 * visualized. It will show up in the metadata sidebar.
 */
export class Metadata_Generic extends Metadata {
  data: any

  constructor(data: any) {
    super();
    this.data = data;
  }

  static from_json(obj: any): Metadata_Generic {
    return new Metadata_Generic(obj);
  }
}

/** Categorical metadata, e.g. gender or shot type. */
export class Metadata_Categorical extends Metadata {
  category_type: string
  category: number

  constructor(category_type: string, category: number) {
    super();
    this.category_type = category_type;
    this.category = category;
  }

  static from_json(obj: any): Metadata_Categorical {
    return new Metadata_Categorical(obj.category_type, obj.category);
  }
}

/** Metadata on caption strings that provides sub-string precision. */
export class Metadata_CaptionMeta extends Metadata {
  meta: Metadata
  char_start: number
  char_end: number

  constructor(meta: Metadata, char_start: number, char_end: number) {
    super();
    this.meta = meta;
    this.char_start = char_start;
    this.char_end = char_end;
  }

  static from_json(obj: any): Metadata_CaptionMeta {
    throw new Error('Not yet implemented');
  }
}

/** Metadata text on bbox. */
export class Metadata_Bbox extends Metadata {
  text: string

  constructor(text: string) {
    super();
    this.text = text;
  }

  static from_json(obj: any): Metadata_Bbox {
    throw new Error('Not yet implemented');
  }
}

/** Metadata to store Keypoint information. See the Keypoints class for
 * constructors from OpenPose and face landmarks. */
export class Metadata_Keypoints extends Metadata {
  keypoints: Keypoints

  constructor(keypoints: Keypoints) {
    super();
    this.keypoints = keypoints;
  }

  /** Format:
      {
        keypoints: {
          index: [x: number, y: number, score: number],
          ...
        },
        edges: [
          [start: number, end: number, color: string],
          ...
        ]
      }
   */
  static from_json(obj: any): Metadata_Keypoints {
    let keypoint_nodes: {[index: number]: KeypointNode} = [];
    let edges: Array<KeypointEdge> = [];

    for (let index of Object.keys(obj.keypoints)) {
      if (typeof index == 'number') {
        let node_tup = obj.keypoints[index];
        keypoint_nodes[index] = {
          x: node_tup[0],
          y: node_tup[1],
          score: node_tup[2]
        }
      }
    }

    for (let edge of obj.edges) {
      edges.push({
        start: edge[0],
        end: edge[1],
        color: edge[2]
      })
    }

    return new Metadata_Keypoints(new Keypoints(keypoint_nodes, edges));
  }
}

export let metadata_from_json = (obj: any): Metadata => {
  let types: any = {
    'Metadata_Categorical': Metadata_Categorical,
    'Metadata_Generic': Metadata_Generic,
    'Metadata_Keypoints': Metadata_Keypoints
  };

  return types[obj.type].from_json(obj.args);
};
