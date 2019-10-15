'''
This example shows how to draw generic text metadata, which will just be shown
stringified below the timeline.
'''

# Rekall imports
from rekall import Interval, IntervalSet, IntervalSetMapping, Bounds3D

# Vgrid imports
from vgrid import VGridSpec, VideoMetadata, VideoBlockFormat
from vgrid import SpatialType_Temporal, Metadata_Generic

# This example assumes a 1920x1080 video at 59.94 FPS, with 20,696 frames.
# You should modify it for your own examples.
video_metadata = [
    VideoMetadata('http://localhost:8000/test.mp4', 0, 59.94, 20696, 1920, 1080)
]

ism = IntervalSetMapping({
    0: IntervalSet([
        Interval(
            Bounds3D(0, 10),
            {
                'spatial_type': SpatialType_Temporal(),
                'metadata': {
                     'generic_metadata': Metadata_Generic(
                       'this will be drawn below the timeline when expanded'
                     ),
                     'other_generic_metadata': Metadata_Generic({
                       'key': 'this object will also be stringified'
                     })
                }
            }
        )
    ])
})

vgrid_spec = VGridSpec(
    video_meta = video_metadata,
    vis_format = VideoBlockFormat(imaps = [
        ('bboxes', ism)
    ])
)

# Pass this to your Javascript application somehow
json_for_js = vgrid_spec.to_json_compressed()

