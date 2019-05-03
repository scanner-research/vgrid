from rekall import Interval, IntervalSet, Bounds3D
from enum import Enum


class SelectType(Enum):
    Positive = 0
    Negative = 1

    @staticmethod
    def from_string(s):
        if s == 'Positive':
            return SelectType.Positive
        elif s == 'Negative':
            return SelectType.Negative


class BlockLabelState:
    """
    Contains all the labels for a given interval block.
    """

    def __init__(self, block_label_state):
        self._new_intervals = IntervalSet([
            Interval(
                Bounds3D(t1=intvl['bounds']['t1'],
                         t2=intvl['bounds']['t2'],
                         x1=intvl['bounds']['bbox']['x1'],
                         x2=intvl['bounds']['bbox']['x2'],
                         y1=intvl['bounds']['bbox']['y1'],
                         y2=intvl['bounds']['bbox']['y2']))
            for intvl in block_label_state['new_intervals']
        ])

        self._captions_selected = None  # TODO

    def new_intervals(self):
        """Returns an interval set of all the created intervals."""
        return self._new_intervals

    def captions_selected(self):
        return self._captions_selected


class LabelState:
    """
    Represents all user input into the VGrid widget.
    """

    def __init__(self, label_state_getter):
        """
        Args:
            label_state_getter: Function with no arguments that returns the JSON label state object.

        Getter needs to be a lambda (as opposed to a direct reference to the object) because that's the
        only way we can observe changes from Jupyter.
        """
        self._label_state_getter = label_state_getter

    def block_labels(self):
        """Returns the BlockLabelState for each interval block."""
        return {
            int(k): BlockLabelState(block)
            for k, block in self._label_state_getter()['block_labels'].items()
        }

    def blocks_selected(self):
        """Returns a SelectType for each selected block."""
        return {
            int(k): SelectType.from_string(v)
            for k, v in self._label_state_getter()['blocks_selected'].items()
        }
