# Camera Example

The `camera` worker is an example of putting controls on the `camera_panel` to control a camera. In theory, the `camera_panel` area on the flight screen could be used to control some other device with a control panel that always needs to be visible, but the main expected use for it is for controlling a camera.

The general idea is that you would implement your own version of `camera.js` to communicate with a camera attached to the CC. So the content of a real camera panel
would depend on what the attached camera is capable of.

The UI it provides is on the camera panel, and provides a means of taking a picture (`take_picture`), starting/stopping video (`toggle_video`), and controlling 
various settings on the (fictional) camera. If an error occurs, the `speech` message is used to communicate the nature of the problem.

## The UI

This also shows the use of `ImageButton` controls with an `icon` attribute that's updated according to camera state. Certain controls become disabled when recording is toggled on, much like you'd do for a real camera.



