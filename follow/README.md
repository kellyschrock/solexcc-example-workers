# Follow Worker

The `follow` worker is a simple example of telling a GCS to send (or to stop sending) locations.

The UI it provides is on the flight screen, with 2 buttons:

-   Start: Tell Solex to start sending locations.
-   Stop: Tell Solex to stop sending locations.

When receiving location updates, Solex will relay its location to this worker whenever it's in any one of its Follow modes,
or when the user taps the map. This worker responds by drawing a circle at the location it receives, just to demo that it's working.


