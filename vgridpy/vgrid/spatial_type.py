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

    def __init__(self, text=None):
        self._text = text

    def to_json(self):
        ret = {"type": "SpatialType_Bbox"}
        if self._text:
            ret["args"] = {"text": self._text}
        return ret


class SpatialType_Temporal(SpatialType):
    """A SpatialType for temporal data"""

    def to_json(self):
        return {"type": "SpatialType_Temporal"}


class SpatialType_Keypoints(SpatialType):
    """A SpatialType for keypoints. Metadata must be Metadata_Keypoints."""

    def to_json(self):
        return {"type": "SpatialType_Keypoints"}
