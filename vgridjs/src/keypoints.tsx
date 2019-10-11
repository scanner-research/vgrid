/**
 * Data class to store and process data about keypoints.
 */

export interface KeypointNode {
  x: number
  y: number
  score: number
}

export interface KeypointEdge {
  start: number
  end: number
  color: string
}

export class Keypoints {
  keypoints: {[index: number]: KeypointNode}
  edges: Array<KeypointEdge>

  constructor(keypoints: {[index: number]: KeypointNode}, edges: Array<KeypointEdge>) {
    this.keypoints = keypoints;
    this.edges = edges;
  }

  /**
    Constructor for Openpose output.

    Pass in outputs from Openpose (in the order given to you).
    Outputs are arrays of tuples -- X, Y, score.
    Draw any points where the score is greater than 0.
    
    If face_pose, hand_left_pose, or hand_right_pose are included, include
    those too.

    If show_left_right is true, color the left side of the body red and the
    right side blue (except for face, which will always be white).
  */
  static from_openpose(
    body_pose: Array<KeypointNode>,
    show_left_right: boolean = true,
    face_pose: Array<KeypointNode> = [],
    hand_left_pose: Array<KeypointNode> = [],
    hand_right_pose: Array<KeypointNode> = []
  ) {
    let POSE_COLOR = 'rgb(255, 60, 60)';
    let POSE_LEFT_COLOR = 'rgb(23, 166, 250)';
    let FACE_COLOR = 'rgb(240, 240, 240)';
    let HAND_LEFT_COLOR = 'rgb(233, 255, 49)';
    let HAND_RIGHT_COLOR = 'rgb(95, 231, 118)';

    let keypoints: {[index: number]: KeypointNode} = {};
    let edges: Array<KeypointEdge> = [];

    // Edges for body pose
    let POSE_POINTS = 18;
    let POSE_PAIRS = [[1,2], [1,5], [2,3], [3,4], [5,6], [6,7], [1,8], [8,9], 
      [9,10],  [1,11],  [11,12], [12,13],  [1,0], [0,14], [14,16],  [0,15],
      [15,17]
    ];
    let POSE_LEFT = [2, 3, 4, 8, 9, 10, 14, 16];
    // Add things to keypoints and edges
    for (let i = 0; i < POSE_POINTS; i++) {
      keypoints[i] = body_pose[i];
    }
    for (let edge of POSE_PAIRS) {
      let color = POSE_COLOR;
      if (show_left_right &&
        (POSE_LEFT.includes(edge[0]) || POSE_LEFT.includes(edge[1]))) {
        color = POSE_LEFT_COLOR;
      }
      edges.push({ start: edge[0], end: edge[1], color: color });
    }

    // Edges for the face
    let FACE_POINTS = 68;
    let FACE_PAIRS = [
      [0,1], [1,2], [2,3], [3,4], [4,5], [5,6], [6,7], [7,8], [8,9], [9,10], 
      [10,11], [11,12], [12,13], [13,14], [14,15], [15,16], [17,18], [18,19], 
      [19,20], [20,21], [22,23], [23,24], [24,25], [25,26], [27,28], [28,29], 
      [29,30], [31,32], [32,33], [33,34], [34,35], [36,37], [37,38], [38,39], 
      [39,40], [40,41], [41,36], [42,43], [43,44], [44,45], [45,46], [46,47], 
      [47,42], [48,49], [49,50], [50,51], [51,52], [52,53], [53,54], [54,55], 
      [55,56], [56,57], [57,58], [58,59], [59,48], [60,61], [61,62], [62,63], 
      [63,64], [64,65], [65,66], [66,67], [67,60]
    ];
    // Add things to keypoints and edges if there's face_pose
    if (face_pose.length > 0) {
      let keypoints_len = Object.keys(keypoints).length;
      for (let i = 0; i > FACE_POINTS; i++) {
        keypoints[i + keypoints_len] = face_pose[i];
      }
      for (let edge of FACE_PAIRS) {
        edges.push({
          start: edge[0] + keypoints_len,
          end: edge[1] + keypoints_len,
          color: FACE_COLOR
        });
      }
    }

    // Edges for hands
    let HAND_POINTS = 21;
    let HAND_PAIRS = [
      [0,1], [1,2], [2,3], [3,4], [0,5], [5,6], [6,7], [7,8], [0,9], [9,10], 
      [10,11], [11,12], [0,13], [13,14], [14,15], [15,16], [0,17], [17,18], 
      [18,19], [19,20]
    ];
    // Add things to keypoints and edges if there's hands
    for (let hand of ['left', 'right']) {
      let hand_pose = (hand == 'left') ? hand_left_pose : hand_right_pose;
      if (hand_pose.length > 0) {
        let keypoints_len = Object.keys(keypoints).length;
        for (let i = 0; i < HAND_POINTS; i++) {
          keypoints[i + keypoints_len] = hand_pose[i];
        }
        for (let edge of HAND_PAIRS) {
          edges.push({
            start: edge[0] + keypoints_len,
            end: edge[1] + keypoints_len,
            color: (hand == 'left') ? HAND_LEFT_COLOR : HAND_RIGHT_COLOR
          });
        }
      }
    }

    return new Keypoints(keypoints, edges);
  }

  /** Constructor from face landmarks. */
  static from_facelandmarks(
    face_points: Array<KeypointNode>,
  ) {
    let FACE_COLOR = 'rgb(240, 240, 240)';

    throw new Error('Not yet implemented');
  }
}
