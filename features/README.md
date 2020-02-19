# Features

Features are a way for Solex to find out from the vehicle what it's capable of. The output is a set of values that is known to Solex, so it can take 
specific action based on what it finds. Currently the things it looks for are as follows:

## `video`

This just indicates whether video streaming support is available on the vehicle. Solex uses it to determine whether to display the 
Video screen when the flight screen is opened. An example of reporting this is in the `video` feature in this directory.

## `joystick`

Indicates CC-level joystick support. When present, Solex will listen for events coming from an external joystick controller (e.g. XBox, etc) and 
send events from that device to the worker specified in `worker_id` in the feature. The relevant event types are `key_event` and `motion_event`.

### `motion_event`

Here are the fields in a `motion_event`:

| id | Description | Range |
|------------|--------------------|-----------|
| `s_l_x`| Left Stick left/right (yaw)   | -1 to 1 |
| `s_l_y`| Left Stick up/down (throttle) | -1 to 1 |
| `s_r_x`| Right Stick left/right (roll)   | -1 to 1 |
| `s_r_y`| Right Stick up/down (pitch) | -1 to 1 |
| `dp_x`| DPad left/right | -1 to 1 |
| `dp_y`| DPad up/down | -1 to 1 |
| `tr_l`| Left trigger | 0 to 1 |
| `tr_r`| Right trigger | 0 to 1 |

To avoid overwhelming the websocket connection with a ton of data, only changed values 
are sent in a joystick message. So if you move the right stick around, you'll see messages like this:

```
{"s_r_x" :0.17647064, "s_r_y": 0.20000005, "id": "on_motion_event"}
```

None of the un-changed values are sent in this case.

### `key_event`

Key events are sent when one of the buttons on the controller is pressed. They have the following identifiers:

| id | keyCode | Description |
|--------|----------|--------------------|
|`button_l1`|102|Left top/front button|
|`button_l2`|104|Left bottom/trigger button|
|`button_r1`|103|Right top/front button|
|`button_r2`|105|Right bottom/trigger button|
|`button_thumb_l`|106|Left stick press down|
|`button_thumb_r`|107|Right stick press down|
|`button_y`|100|Y button|
|`button_x`|99|X button|
|`button_a`|96|A button|
|`button_b`|97|B button|
|`button_start`|108|Start button|
|`button_select`|109|Select button|

These are sent in the `key_event` event specified in the `feature` for the joystick worker. So if you specify that as (eg) `on_key_event`, you'll
see a message like this when a button is pressed on the controller:

Key down:
```
{"100":1, "name":"button_y", "id":"on_key_event"}
```

Key up:
```
{"100":0, "id":"on_key_event"}
```


## `mission`

Indicates CC-level mission support. When a worker reports mission support, Solex will send a JSON-encoded version of the mission to it
when it uploads the mission to the flight controller. It will use the message specified in the `upload_mission_id` attribute to send it.

Once that's done, the mission-support worker can monitor the progress of the mission as it runs, executing any worker-based actions on waypoints
that have been specified by the user when the vehicle arrives at them.

Which brings us to the `support` section of the output, and actions. This array lists all of the workers with mission support on the CC, if any. What is
meant by "mission support" in this case is that if a worker has commands that can be executed as part of a mission, they're listed here.

For example, suppose you have a worker that supports an attached camera, and you want to be able to set it to start or stop video recording automatically
in a mission at specific points, or take photos. You would add a `getMissionItemSupport()` function to your camera worker, as shown in the `camera` example. 
That function returns a list of actions that can be applied to mission items.

Then, when editing a mission targeted to that vehicle, the "Actions" list for a waypoint item displays options for Video: Start and Stop. 

### Action parameters

Simply calling a "start" command or something on a worker to do something is generally insufficient, just as simply typing `rm` in a Linux terminal to delete
an unspecified file is insufficient. A worker typically needs to know _how_ to execute a given command. For that, there are `params` that can be specified for
commands that require them. This lets Solex provide a UI for configuring a given action for a specific task.

#### Params

Parameters have the following attributes (some of which are optional based on `type`):

-   `id`: The param id. This will appear as an element name in the JSON for the command that's sent to the worker to execute the command.
-   `name`: The name the user will see for that parameter.
-   `type`: The parameter type. Legal values are `string`, `int`, `float`, or `enum` (explained below).
    -   When the value is an `enum` type, the parameter appears as a drop-down list the user can pick from.
-   `values`: (enum only): A list of possible enum values.
-   `min`: (int/float only) The minimum allowed value for the parameter. When `min` and `max` are specified, the field appears as a slider in the UI.
-   `max`: (int/float only) The maximum allowed value for the parameter.
-   `default`: The default value if nothing else is specified.

So here's an example. Given an action like this:

```javascript
{ 
    id: "on", 
    name: "On", 
    msg_id: "lights_on", 
    params: [
        {id: "brightness", name: "Brightness", type: "int", min: 10, max: 100 },
        {id: "color", name: "Color", type: "enum", values: ["white", "red", "green", "yellow"], default: "white" }
    ]
}
```

Suppose the user selects "red" from the list and slides "brightness" to 50. The resulting message sent to the worker will look like this:

```javascript
{
    id: "lights_on",
    brightness: 50,
    color: "red"
}
```

## Notes

One thing to take note of here is the little "mini API" that exists between the action workers and the mission-support worker. For filling out the `/features`
response, the flow is as follows:

1.  SolexCC iterates all of the enabled installed workers, requesting features.
2.  The mission-support worker responds to this request.
3.  The mission-support worker interrogates all of its peers to see if they have a `getMissionItemSupport()` function. Any of them that do get their output
    added to the output for the support worker.

The output is an object that shows the `fake_lights`, `fake_sensor`, and `camera` workers with actions that can be assigned to mission items. 
