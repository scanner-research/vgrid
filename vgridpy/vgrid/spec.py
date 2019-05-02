from rekall import IntervalSet
from enum import Enum
from abc import ABC
import subprocess as sp
import json
import os
import shlex
import zlib


class VideoMetadata:
    """Metadata about a video.

    The basic metadata is the video path and ID. The ID can be any
    arbitrary unique number, or a database ID if you have one.
    Video metadata (width, height, fps, etc.) is either provided
    explicitly by the caller, or extracted from the video file using
    ffprobe.  Since the implementation uses ffprobe, automatic
    extraction is only supported for paths on the local machine.
    """

    def __init__(self, path, id=None, fps=None, num_frames=None, width=None, height=None):

        if fps is None:
            if not os.path.isfile(path):
                raise Exception(
                    "Error: local video path {} does not exist and video metadata not explicitly specified"
                    .format(path))

            cmd = 'ffprobe -v quiet -print_format json -show_streams "{}"' \
                .format(path)
            outp = sp.check_output(shlex.split(cmd)).decode('utf-8')
            streams = json.loads(outp)['streams']
            video_stream = [s for s in streams if s['codec_type'] == 'video'][0]
            width = int(video_stream['width'])
            height = int(video_stream['height'])
            [num, denom] = map(int, video_stream['r_frame_rate'].split('/'))
            fps = float(num) / float(denom)
            num_frames = int(video_stream['nb_frames'])

        self.path = path
        self.id = id
        self.fps = fps
        self.num_frames = num_frames
        self.width = width
        self.height = height

    def duration(self):
        return self.num_frames / self.fps

    def to_json(self):
        return {
            'id': self.id,
            'path': self.path,
            'num_frames': self.num_frames,
            'fps': self.fps,
            'width': self.width,
            'height': self.height
        }


class KeyMode(Enum):
    """
    KeyMode is the set of key bindings for the VGrid widget to use.
    """

    Standalone = 1
    Jupyter = 2

    def to_string(self):
        if self == KeyMode.Standalone:
            return 'Standalone'
        elif self == KeyMode.Jupyter:
            return 'Jupyter'


class VGridSpec:
    """
    Specification for data to show inside VGrid.
    """

    def __init__(self,
                 video_meta,
                 interval_blocks=None,
                 vis_format=None,
                 spinner_dev_mode=False,
                 key_mode=KeyMode.Jupyter,
                 frameserver_endpoint='http://localhost:7500/fetch',
                 video_endpoint='http://localhost:8000/',
                 use_frameserver=False,
                 show_timeline=True,
                 blocks_per_page=50):
        """
        Args:
            video_meta: List of VideoMetadata objects describing all videos in the interval blocks
            interval_blocks: List of IntervalBlock objects explicitly describing the VGrid data format
            vis_format: VisFormat object describing a strategy to create IntervalBlocks
            key_mode: Key bindings to use
            frameserver_endpoint: Base URL path to access the frameserver
            video_endpoint: Base URL path to access the videos
            use_frameserver: Whether to use frameserver or HTMl5 video element for thumbnails
            show_timeline: If false, disables the timeline
            blocks_per_page: Number of interval blocks to show at one time
        """
        self._interval_blocks = interval_blocks
        self._vis_format = vis_format

        if not ((self._interval_blocks is None) ^ (self._vis_format is None)):
            raise Exception("One of interval_blocks or vis_format should be set (but not both).")

        self._settings = {
            'spinner_dev_mode': spinner_dev_mode,
            'key_mode': key_mode.to_string(),
            'frameserver_endpoint': frameserver_endpoint,
            'video_endpoint': video_endpoint,
            'use_frameserver': use_frameserver,
            'show_timeline': show_timeline,
            'blocks_per_page': blocks_per_page
        }

        self._video_meta = video_meta

    def to_json(self):
        if self._interval_blocks is not None:
            interval_blocks = self._interval_blocks
        else:
            interval_blocks = self._vis_format.interval_blocks()

        return {
            'interval_blocks': [block.to_json() for block in interval_blocks],
            'settings': self._settings,
            'database': {
                'videos': [meta.to_json() for meta in self._video_meta]
            }
        }

    def to_json_compressed(self):
        obj = self.to_json()
        return {'compressed': True, 'data': zlib.compress(json.dumps(obj).encode('utf-8'))}
