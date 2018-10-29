# How to use vgrid

The `VGrid` component expects a `settings` object and a `data` object.
The options for the `settings` object are in `VGrid.jsx` (see
`default_settings`.)

The `data` object needs three fields: `groups`, `tables`, and `categories`.

`tables` has fields `frames`, `labelers`, and `videos`, which hold relevant
rows from those tables in the database.
The format is from `id` to the rest of the database entry.

`categories` similarly holds tables from the database, except it holds relevant
rows from the `gender`, `identities`, and `topics` tables.

`groups` holds the actual data that we want to visualize: it is an array of
objects.
Each of these objects has `label`, `type`, and `elements` fields.
Their meaning depends on the value of `label`.

If `type` is `flat`, then VGrid will display a single frame with bounding box
annotations.
Then `elements` is a list of objects with fields `video`, `min_frame`, and
`objects`.
If these objects are all in the same "group" we expect their `video` fields to
be the same.
`objects` contains an array of objects to draw on the frame.
Of each of these objects has an `id`, a `type`, and optionally more elements.
If `type` is `bbox`, then we expect the objects to have fields `bbox_x1`,
`bbox_x2`, `bbox_y1`, and `bbox_y2`.
They can also optionally have fields `gender_id` and `identity_id`.
If `type` is `pose`, then we expect fields `labeler`, and `keypoints`, which is
an object with fields `hand_left`, `hand_right`, `pose`, and `face`.

If `type` is `contiguous`, then VGrid will display a timeline of segments
under each video.
In this case, each group also needs a field `num_frames`, which is the number
of frames in the video.
We expect the video ID to be in the field `label`.
`elements` is again a list of objects, but this time it is a list of timelines.
Each timeline needs elements `segments`, `video`, and (optionally) `color`.
`segments` is a list of segments, with fields `min_frame` and `max_frame`.
These are the start and end of each segment.
