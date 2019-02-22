# Start Panel

The `start_panel` worker is a simple example of putting buttons on the `worker_buttons` panel in the startup screen, and responding to UI events.

The UI is supplied in the `onScreenEnter()` function with a single argument of `start`. In response, the `start_panel` worker loads a .json file 
containing the layout to add to the `worker_buttons` panel in Solex. 

## Events

In the `worker_buttons.json` file, take note of the `do_dialog` Button control. It has an `id` attribute, which is required if a button click should send 
a command to a worker. Another thing that's required is the `on_click` attribute. That's specified like this:

```json
"on_click": {
    "worker_id": "start_panel",
    "msg_id": "show_dialog"
}
```
This essentially says that when the `do_dialog` is clicked, Solex should send a `show_dialog` message to `start_panel`. Simple enough.

If there are other values you want to send along as attributes on your message, specify unique `id` and `name` attributes for each of the controls in a given 
layout, and all their values will be sent in the body of the message. Other examples show how this is done.

