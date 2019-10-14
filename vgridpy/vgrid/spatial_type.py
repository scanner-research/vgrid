from abc import ABC


class SpatialType(ABC):
    def to_json(self):
        raise NotImplemented


class SpatialType_Caption(SpatialType):
    """A SpatialType for displaying text in caption box"""

    def __init__(self, text):
        """Initialize

        Args:
            get_caption (optional): A function from Interval to caption.
                Defaults to the payload field
        """
        self._text = text

    def to_json(self):
        return {
            "type": "SpatialType_Caption",
            "args": {
                "text": self._text
            },
        }


class SpatialType_Bbox(SpatialType):
    """A SpatialType for drawing bounding boxes"""

    def to_json(self):
        return {"type": "SpatialType_Bbox"}

class SpatialType_Temporal(SpatialType):
    """A SpatialType for temporal data"""

    def to_json(self):
        return {"type": "SpatialType_Temporal"}

class SpatialType_Keypoints(SpatialType):
    """A SpatialType for keypoints. Metadata must be Metadata_Keypoints."""

    def to_json(self):
        return {"type": "SpatialType_Keypoints"}
