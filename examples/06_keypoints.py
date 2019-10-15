'''
This example shows how to draw a simple bounding box.
'''

# Rekall imports
from rekall import Interval, IntervalSet, IntervalSetMapping, Bounds3D

# Vgrid imports
from vgrid import VGridSpec, VideoMetadata, VideoBlockFormat
from vgrid import SpatialType_Keypoints, Metadata_Keypoints


# This example assumes a 1920x1080 video at 59.94 FPS, with 20,696 frames.
# You should modify it for your own examples.
video_metadata = [
    VideoMetadata('http://localhost:8000/test.mp4', 0, 59.94, 20696, 1920, 1080)
]


# this is a pose in the top left - a few joints are missing!
openpose_output = [
    [0.22650307416915894, 0.27375876903533936, 0.3149244785308838],
    [0.22417104244232178, 0.32567211985588074, 0.3093278706073761],
    [0.20095767080783844, 0.3175240159034729, 0.27658525109291077],
    [0.17199449241161346, 0.34749752283096313, 0.2144150584936142],
    [0.20213444530963898, 0.31754812598228455, 0.17792995274066925],
    [0.24505363404750824, 0.3393658995628357, 0.2958287000656128],
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0],
    [0.1870177835226059, 0.4457924962043762, 0.11119991540908813],
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0],
    [0.21950992941856384, 0.46496498584747314, 0.09123159199953079],
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0],
    [0.2253301590681076, 0.2600831389427185, 0.30744627118110657],
    [0.2345585972070694, 0.26827168464660645, 0.34357455372810364],
    [0.21832072734832764, 0.271005243062973, 0.08734595775604248],
    [0.24386557936668396, 0.2819412648677826, 0.30233266949653625]
]

ism = IntervalSetMapping({
    0: IntervalSet([
        Interval(
            Bounds3D(0, 10, 0.17199, 0.24505, 0.26008, 0.46496),
            {
                'spatial_type': SpatialType_Keypoints(),
                'metadata': {
                    # This function can also parse faces and hands
                    'pose': Metadata_Keypoints.from_openpose(
                        openpose_output
                    )
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
