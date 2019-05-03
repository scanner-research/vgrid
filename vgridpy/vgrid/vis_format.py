from abc import ABC
from .interval_block import IntervalBlock, NamedIntervalSet
from rekall import IntervalSet, Interval, Bounds3D


class VisFormat(ABC):
    def interval_blocks(self):
        raise NotImplemented


class VideoBlockFormat(VisFormat):
    """Format where each interval block contains all the labels for a given video."""

    def __init__(self, imaps=None, video_meta=None):
        """
        You must either provide the IntervalSetMappings to draw, or just a list of video_meta
        to show only the video.

        Args:
            imaps: List of (name, IntervalSetMapping) pairs
            video_meta: List of VideoMetadata objects
        """
        assert (imaps is not None) ^ (video_meta is not None)
        self._imaps = imaps
        self._video_meta = video_meta

    def interval_blocks(self):
        if self._imaps is not None:
            _, example_imap = self._imaps[0]
            return [
                IntervalBlock(
                    video_id=video_key,
                    interval_sets=[
                        NamedIntervalSet(name=name, interval_set=imap[video_key])
                        for (name, imap) in self._imaps
                    ])
                for video_key in example_imap
            ] # yapf: disable
        else:
            return [
                IntervalBlock(
                    video_id=meta.id,
                    interval_sets=[
                        NamedIntervalSet(
                            name='default',
                            interval_set=IntervalSet(
                                [Interval(Bounds3D(0, meta.duration()))]))
                    ]) for meta in self._video_meta
            ] # yapf: disable


class FlatFormat(VisFormat):
    """Format where each interval is its own block."""

    def __init__(self, imap):
        """
        Args:
            imap: IntervalSetMapping to display
        """
        self._imap = imap

    def interval_blocks(self):
        return [
            IntervalBlock(
                video_id=video_key,
                interval_sets=[
                    NamedIntervalSet(name='default', interval_set=IntervalSet([interval]))
                ])
            for video_key in self._imap
            for interval in self._imap[video_key].get_intervals()
        ] # yapf: disable


class NestedFormat(VisFormat):
    """
    Format where each interval block contains the interval set in the payload of
    each top-level interval.
    """

    def __init__(self, imap):
        """
        Args:
            imap: IntervalSetMapping where each interval has an IntervalSet payload
        """
        self._imap = imap

    def interval_blocks(self):
        return [
            IntervalBlock(
                video_id=video_key,
                interval_sets=[
                    NamedIntervalSet(name='default', interval_set=interval.payload)
                ])
            for video_key in self._imap
            for interval in self._imap[video_key].get_intervals()
        ] # yapf: disable
