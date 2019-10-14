from .spatial_type import SpatialType, SpatialType_Bbox
from .metadata import Metadata

class IntervalBlock:
    """
    IntervalBlock is a single block (video + timeline) in the grid. An interval block
    contains a list of NamedIntervalSets all within a single video, indicated by the video_id.
    The video_id must map to an ID used in the VideoMetadata passed to the VGridSpec.
    """

    def __init__(self, interval_sets, video_id):
        self.interval_sets = interval_sets
        self.video_id = video_id

    def to_json(self):
        return {
            'interval_sets': [iset.to_json() for iset in self.interval_sets],
            'video_id': self.video_id
        }


class NamedIntervalSet:
    """
    NamedIntervalSet is a Rekall interval set with a name. If the interval set
    has the following payload structure, the spatial type and metadata will be
    propagated to Vgrid for visualization:

    {
      "spatial_type": SpatialType,
      "metadata": {any_key: Metadata}
    }

    Otherwise, the interval set will default to SpatialType_Bbox with no
    metadata.
    """

    def __init__(self, name, interval_set):
        self.name = name
        self.interval_set = interval_set

    def _payload_to_json(self, payload):
        if payload is None or not isinstance(payload, dict):
            spatial_type = SpatialType_Bbox()
            metadata = {}
        else:
            spatial_type = SpatialType_Bbox() \
                           if 'spatial_type' not in payload else payload['spatial_type']
            metadata = {} if 'metadata' not in payload else payload['metadata']

        if not isinstance(spatial_type, SpatialType):
            raise Exception("Payload spatial_type must be of type vgrid.SpatialType")

        for k, v in metadata.items():
            if not isinstance(v, Metadata):
                raise Exception("Payload metadata key {} must be of type vgrid.Metadata".format(k))

        return {
            'spatial_type': spatial_type.to_json(),
            'metadata': {k: v.to_json()
                         for k, v in metadata.items()}
        }

    def to_json(self):
        return {'name': self.name, 'interval_set': self.interval_set.to_json(self._payload_to_json)}
