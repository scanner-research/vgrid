from .spatial_type import SpatialType, SpatialType_Bbox


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
    NamedIntervalSet is a Rekall interval set with a name. The interval set must have
    the following payload structure:

    {
      "spatial_type": SpatialType,
      "metadata": {any_key: Metadata}
    }
    """

    def __init__(self, name, interval_set):
        self.name = name
        self.interval_set = interval_set

    def _payload_to_json(self, payload):
        if payload is None:
            payload = {'spatial_type': SpatialType_Bbox(), 'metadata': {}}

        if not isinstance(payload, dict):
            raise Exception(
                "VGrid interval payload must be a dictionary {'spatial_type': SpatialType, 'metadata': {any key: Metadata}}"
            )

        if not 'spatial_type' in payload or not isinstance(
                payload['spatial_type'], SpatialType):
            raise Exception(
                "Payload must contain key `spatial_type` with a value of type SpatialType"
            )

        if 'metadata' not in payload:
            payload['metadata'] = {}

        return {
            'spatial_type': payload['spatial_type'].to_json(),
            'metadata':
            {k: v.to_json()
             for k, v in payload['metadata'].items()}
        }

    def to_json(self):
        return {
            'name': self.name,
            'interval_set': self.interval_set.to_json(self._payload_to_json)
        }
