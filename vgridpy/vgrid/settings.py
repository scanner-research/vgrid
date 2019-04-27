class VGridSettingsBuilder:
    keys = [
        'spinner_dev_mode', 'key_mode', 'frameserver_endpoint',
        'video_endpoint', 'use_frameserver', 'show_timeline'
    ]

    def __init__(self):
        self.settings = {}

    def _add_setting(self, k, v):
        self.settings[k] = v
        return self

    def __getattr__(self, k):
        if k in self.keys:
            return lambda v: self._add_setting(k, v)
        raise Exception("Invalid setting `{}`".format(k))

    def build(self):
        return self.settings
