# SolexCC UI Examples

Once you've installed a companion computer (CC) on your vehicle and installed SolexCC on it, you'll be able to upload arbitrary pieces of code ("workers") to do whatever you want. This can include controlling a camera, providing an interface to various extra sensors on your vehicle, lights, or even controlling the vehicle's movement 
through Mavlink. 

The role of SolexCC's UI is to let you write code in your workers to display UI elements in the Solex app so you can control the extra features. 

The samples in this directory are meant to show how you can display controls on the Solex screens, display full-screen views in Solex, display
dialog boxes, send speech and "toast" messages, etc.

## Examples

These are the best place to see the various controls in action.

-   **Toast** demonstrates sending Toast messages to Solex for displaying short messages on the screen.
-   **Speech** demonstrates sending spoken messages to Solex.
-   **Start Panel** demonstrates putting basic controls on the Solex start screen, as well as displaying simple and more complex dialog boxes.
	Also, the "widgets" button on the start screen displays a lot of controls so you can see what they look like and how they interact.
-	**Left Panel** shows how to put buttons on the left-hand "workers" panel on the flight screen
-   **Video** Demonstrates putting basic controls on the Video screen.
-   **Map** Demonstrates controls on the Map view.
-   **Camera** Demonstrates creating and populating a camera control panel.
-   **Phasers** Goofy contrived example using a bunch of features. Demonstrates putting controls in the "Shot Buttons" area of the flight screen, putting a full-screen view over the flight screen, and interacting with a worker on the fly. Also conditionally shows the flight-screen controls (Phasers have to be "armed" in the start screen).

_NOTE:_ If you load all of these examples, the UI is going to look quite cluttered. To avoid this, you can go into the SolexCC control panel
and enable/disable specific workers to avoid showing everything at once.

## Layouts

Layouts are defined a lot like a JSON version of layouts in an Android application. The names used for types are largely the same as they would be in an Android XML layout file. The base set of controls are:

-	`Space` - A basic view that takes up space. If you want it to be visible, use the "background" attribute to set a color.
-	`Spinner` - A drop-down list of selectable items. 
-	`TextView` - An area for text to display in.
-	`EditText` - An editable field. 
-	`ProgressBar` - A progress bar that displays progress from 0 to `max`.
-	`SeekBar` - A progress bar the user can move.
-	`Button` - A button that can be clicked.
-	`RadioGroup` - A group of related mutually-exclusive options.
-	`RadioButton` - An option in a `RadioGroup`.
-	`CheckBox` - A checkable box that indicates a boolean value.
-	`Switch` - A checkable box that indicates a boolean value, and looks cooler than a CheckBox.
-	`FrameLayout` - A container for other controls.
-	`LinearLayout` - A container for other controls that can lay them out either vertically or horizontally.
-	`ImageButton` - A button with an image instead of text. See the `icon` attribute in the examples.
-	`ImageView` - A view where an icon can be displayed.
-	`ScrollView` - A view that scrolls its contents vertically.
-	`HorizontalScrollView` - A view that scrolls its contents horizontally.

### Layouts in files 

You'll notice in the examples, the layouts are defined in static files which are read and sent to Solex. It's entirely possible for a worker to generate a screen layout dynamically in code, vs putting layouts in external files like this. But it's honestly easier to deal with them in files, because they can be updated and viewed without having to reload a worker that creates them dynamically.

## Where you can put views

Here's a list of screens and panel ids you can use to control where your UI elements go

-	`start`: Startup screen
	-	`worker_buttons`: Vertical panel under the "WiFi settings" button.
-	`flight`: Flight screen
	-	`camera_panel`: The sliding panel on the right.
	-	`worker_shot_buttons`: The area where the "Smart Shots" button normally goes when connected to a Solo.
	-	`worker_status`: A horizontal area under the top status bar.
-	`commands`: Commands panel on the left.
	-	`worker_flight_buttons`: A vertical area on the "workers" panel (which is invisible unless something populates it).
-	`video`: The video screen.
	-	`video_main`: The top-central area of the video screen.
	-	`video_bottom`: The bottom of the video screen.
-	`map`: The map screen.
	-	`map_main`: The upper part of the map area.
	-	`map_bottom`: The bottom of the map, above the panel that slides up when you select a mission to fly.

Note that when you display a full-screen view (as in the `phasers` or `start_panel` "Widgets!" example), your screen can cover the whole area. If you want to see what's behind it, make it transparent by not specifying a `background` attribute, or by specifying a low-alpha `background` attribute for a tint (e.g. #6600ff00).

## Events

Events are how your screens communicate to workers. 

Suppose you have a screen with some edit fields, a slider, and a drop-down selector (Spinner) on it. You want to specify some things in the screen and hit a button, and have your worker get the values that you entered. It's pretty easy. 

In order to actually send a message, you need to define an `on_click` event for the button, which looks like this:

```json
"on_click": {
	"worker_id": "my_worker", "msg_id", "my_message"
}
```
...and make sure the button has an id. Do that by specifying an `id` attribute with a unique value, e.g. `"id": "my_button"`

For each control's value you want to include in the `my_message` message, specify an `id` and `name` attribute for that control. For example, an edit field:

```json
{
	"type": "EditText",
	"id": "edit_first_name",
	"name": "first_name",
	"hint": "First Name",
	"text": "Joe"
}
```

When the `my_message` message is sent to `my_worker`, the body of the message will look like this:

```json
{
	"id": "my_message",
	"first_name": "Joe" 
}
```
(or whatever the user typed into the `first_name` field)

This is true of any control on a screen. A `SeekBar`'s `progress` value will be reported as whatever its `name` value is:

```json
"my_slider": 50
```

### Events from non-buttons

The `left_panel` example shows how a `Switch` is used to trigger an event without having an associated button:

```json
"name": "lights",
"on_check": {
	"worker_id": "left_panel", "msg_id": "set_lights"
}
```
When the switch is flipped, the `left_panel` worker gets a `set_lights` message with a `lights` attribute of true or false depending on whether the switch
is on or off. 

### Control Events
Here's a list of controls and the events they provide:

-	**All Views**: `on_click`
-	`CheckBox`, `Switch`: `on_check`
-	`SeekBar`: `on_progress`
-	`EditText`: `on_text_changed`
-	`RadioGroup`: `on_check` (see the `phasers` example)
-	`Spinner`: `on_item_selected`
-	`RecyclerView`: `on_item_selected`

Any full-screen view you create can also specify an `on_back` event. When this is specified, pressing the Back button will send the specified to the specified worker.

## Updating Screens 

Another common thing to do is update the UI in response to changing conditions. For example, suppose you have a gas-powered vehicle with a fuel tank, and want to report engine RPM and fuel level. So on the `flight` screen, you have a couple of views in the `worker_status` area for fuel level and RPM so they're readily visible. Call them `txt_fuel` and `txt_rpm`.

In your worker's `loop()` function, you're monitoring RPM and fuel level. When one or the other of them changes, you can update the screen like this:

```javascript
const color = (fuelLevelPercent >= 20)? "green": "red";

ATTRS.sendGCSMessage(ATTRS.id, {
	id: "screen_update",
	screen_id: "flight",
	panel_id: "worker_status",
	values: {
		txt_fuel: { text: `Fuel ${fuelLevelPercent}%`, textColor: color },
		txt_rpm: { text: `${engineRpm} rpm` }
	}
});
```

You can update any attribute of a control in this way, including `enabled` state, text, color, and so on.

The "Phasers" example, dumb though it is, gives some hints about updating screens.

