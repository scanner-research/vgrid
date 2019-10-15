from abc import ABC


class Metadata(ABC):
    def to_json(self):
        raise NotImplemented


class Metadata_Flag(Metadata):
    def __init__(self):
        pass

    def to_json(self):
        return {"type": "Metadata_Flag"}


class Metadata_Generic(Metadata):
    """A Metadata that stores generic JSON"""

    def __init__(self, data):
        self._data = data

    def to_json(self):
        return {"type": "Metadata_Generic", "args": {"data": self._data}}


class Metadata_Categorical(Metadata):
    """A Metadata that stores categorical values"""

    def __init__(self, category_name, category):
        self._category_name = category_name
        self._category = category

    def to_json(self):
        return {
            "type": "Metadata_Categorical",
            "args": {
                "category_type": self._category_name,
                "category": self._category
            },
        }


class Metadata_CaptionMeta(Metadata):
    """A Metadata on caption strings that provides sub-string precision."""

    def __init__(self, meta, char_start, char_end):
        """meta is expended to be Metadata and have to_json on it."""
        self._meta = meta
        self._char_start = char_start
        self._char_end = char_end

    def to_json(self):
        return {
            "type": "Metadata_CaptionMeta",
            "args": {
                "meta": self._meta.to_json(),
                "char_start": self._char_start,
                "char_end": self._char_end
            }
        }


class Metadata_Bbox(Metadata):
    """Metadata text on bbox."""

    def __init__(self, text):
        self._text = text

    def to_json(self):
        return {
            "type": "Metadata_Bbox",
            "args": {
                "text": self._text
            }
        }

class Metadata_Keypoints(Metadata):
    """Metadata for keypoints locations."""
    def __init__(self, keypoint_nodes, edges):
        """
        Format of keypoint_nodes:
            {
                index: [x, y, score],
                ...
            }

        We expect index to be an integer, x and y to be floats (relative to the
        frame, and score to be a float).

        For example:
            {
                0: [0.1, 0.5, 1.0],
                1: [0.5, 0.5, 1.0]
            }

        Format of edges:
            [
                [start, end, color],
                ...
            ]

        For example:
            [
                [0, 1, "red"]
            ]
        
        We expect start and end to be integers (indexed into keypoint_nodes),
        and color to be a string.
        """
        self._keypoint_nodes = keypoint_nodes
        self._edges = edges

    def to_json(self):
        return {
            "type": "Metadata_Keypoints",
            "args": {
                "keypoints": self._keypoint_nodes,
                "edges": self._edges
            }
        }

    @classmethod
    def from_openpose(
        cls,
        body_pose,
        show_left_right = True,
        face_pose = [],
        hand_left_pose = [],
        hand_right_pose = []
    ):
        """Construct Keypoint metadata from Openpose outputs."""
        POSE_COLOR = 'rgb(255, 60, 60)'
        POSE_LEFT_COLOR = 'rgb(23, 166, 250)'
        FACE_COLOR = 'rgb(240, 240, 240)'
        HAND_LEFT_COLOR = 'rgb(233, 255, 49)'
        HAND_RIGHT_COLOR = 'rgb(95, 231, 118)'

        POSE_POINTS = 18
        POSE_PAIRS = [[1,2], [1,5], [2,3], [3,4], [5,6], [6,7], [1,8], [8,9], 
            [9,10],  [1,11],  [11,12], [12,13],  [1,0], [0,14], [14,16],
            [0,15], [15,17]
        ]
        POSE_LEFT = [2, 3, 4, 8, 9, 10, 14, 16]

        # Body keypoints
        keypoints = {
            i: body_pose[i]
            for i in range(POSE_POINTS)
        }
        edges = [
            [
                edge[0], 
                edge[1], 
                POSE_LEFT_COLOR if (show_left_right and (
                    edge[0] in POSE_LEFT or
                    edge[1] in POSE_LEFT
                )) else POSE_COLOR]
            for edge in POSE_PAIRS
        ]

        # Face keypoints
        FACE_POINTS = 68
        FACE_PAIRS = [
            [0,1], [1,2], [2,3], [3,4], [4,5], [5,6], [6,7], [7,8], [8,9], [9,10], 
            [10,11], [11,12], [12,13], [13,14], [14,15], [15,16], [17,18], [18,19], 
            [19,20], [20,21], [22,23], [23,24], [24,25], [25,26], [27,28], [28,29], 
            [29,30], [31,32], [32,33], [33,34], [34,35], [36,37], [37,38], [38,39], 
            [39,40], [40,41], [41,36], [42,43], [43,44], [44,45], [45,46], [46,47], 
            [47,42], [48,49], [49,50], [50,51], [51,52], [52,53], [53,54], [54,55], 
            [55,56], [56,57], [57,58], [58,59], [59,48], [60,61], [61,62], [62,63], 
            [63,64], [64,65], [65,66], [66,67], [67,60]
        ]
        if len(face_pose) > 0:
            keypoints_len = len(keypoints)
            for i in range(FACE_POINTS):
                keypoints[i + keypoints_len] = face_pose[i]
            edges += [
                [ edge[0] + keypoints_len, edge[1] + keypoints_len, FACE_COLOR ]
                for edge in FACE_PAIRS
            ]
                
        # Hand keypoints
        HAND_POINTS = 21
        HAND_PAIRS = [
            [0,1], [1,2], [2,3], [3,4], [0,5], [5,6], [6,7], [7,8], [0,9], [9,10], 
            [10,11], [11,12], [0,13], [13,14], [14,15], [15,16], [0,17], [17,18], 
            [18,19], [19,20]
        ]
        for hand in ["left", "right"]:
            hand_pose = hand_left_pose if hand == "left" else hand_right_pose
            if len(hand_pose) > 0:
                keypoints_len = len(keypoints)
                for i in range(HAND_POINTS):
                    keypoints[i + keypoints_len] = hand_pose[i]
                edges += [
                    [
                        edge[0] + keypoints_len, 
                        edge[1] + keypoints_len, 
                        HAND_LEFT_COLOR if hand == "left" else HAND_RIGHT_COLOR
                    ]
                    for edge in HAND_PAIRS
                ]
        
        return cls(keypoints, edges)
