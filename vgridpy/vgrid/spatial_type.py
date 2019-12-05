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

    def __init__(self, text=None, fade=None):
        self._text = text
        self._fade = fade

    def to_json(self):
        ret = {"type": "SpatialType_Bbox"}
        if self._text or self._fade:
            ret["args"] = {}
            if self._text:
                ret["args"]["text"] = self._text
            if self._fade:
                ret["args"]["fade"] = self._fade
        return ret


class SpatialType_Temporal(SpatialType):
    """A SpatialType for temporal data"""

    def to_json(self):
        return {"type": "SpatialType_Temporal"}


class SpatialType_Keypoints(SpatialType):
    """A SpatialType for keypoints. Metadata must be Metadata_Keypoints."""

    def to_json(self):
        return {"type": "SpatialType_Keypoints"}
