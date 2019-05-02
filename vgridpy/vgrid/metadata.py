from abc import ABC


class Metadata(ABC):
    def to_json(self):
        raise NotImplemented


class Metadata_Flag(Metadata):
    def __init__(self):
        pass

    def to_json(self):
        return {"type": "Metadata_Flag"}


class Metadata_Generic(Metadata):
    """A Metadata that stores generic JSON"""

    def __init__(self, data):
        self._data = data

    def to_json(self):
        return {"type": "Metadata_Generic", "args": {"data": data}}


class Metadata_Categorical(Metadata):
    """A Metadata that stores categorical values"""

    def __init__(self, category_name, category):
        self._category_name = category_name
        self._category = category

    def to_json(self):
        return {
            "type": "Metadata_Categorical",
            "args": {
                "category_type": self._category_name,
                "category": self._category
            },
        }
