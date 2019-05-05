'use strict';

const ATTRS = {
    id: "map_draw",
    // Name/description
    name: "Map Draw",
    description: "Draws shapes on the map",
    // Does this worker want to loop?
    looper: false,
    // Mavlink messages we're interested in
    mavlinkMessages: []
};

function getAttributes() { return ATTRS; }

var mHere = null;
var mLastPath = null;

function d(str) {
    if(module === process.mainModule) {
        console.log(str);
    } else {
        ATTRS.log(ATTRS.id, str);
    }
}

// Called from dispatch.loop()
function loop() {
}

// Called when this worker is loaded.
function onLoad() {
    d("onLoad()");

    ATTRS.api.Vehicle.setIds(1, 1);
    // Update the mavlink messages we're interested in.
    // Note that we can't do it in ATTRS above, since Vehicle isn't loaded into this module
    // at that point. It has to be done after the worker is loaded (and injected with the Vehicle dependency).
    ATTRS.subscribeMavlinkMessages(ATTRS.id, ATTRS.api.Vehicle.getVehicleMavlinkMessages());
    // Various Vehicle API calls generate mavlink messages to send to the vehicle.
    // This function relays them to the flight controller.
    ATTRS.api.Vehicle.setMavlinkSendCallback(function (msg) {
        d(`Send mavlink: ${msg.name}`);
        ATTRS.sendMavlinkMessage(ATTRS.id, msg);
    });

    ATTRS.api.Vehicle.addEventListener(mVehicleEventListener);
}

// Called when unloading
function onUnload() {
    d("onUnload()");

    ATTRS.api.Vehicle.setMavlinkSendCallback(null);
    ATTRS.api.Vehicle.removeEventListener(mVehicleEventListener);
}

// Listen for vehicle events
const mVehicleEventListener = {
    onDroneEvent: function (event, extras) {
        // d("onDroneEvent(): event=" + event + " extras=" + JSON.stringify(extras || {}));

        switch (event) {
            case ATTRS.api.Vehicle.Events.LOCATION_UPDATED: {
                onVehicleMoved(extras);
                break;
            }
        }
    }
};

// Called when a Mavlink message arrives
function onMavlinkMessage(msg) {
    // d(`onMavlinkMessage(${msg.name})`);
    ATTRS.api.Vehicle.onMavlinkMessage(msg);
}

// Called when the GCS sends a message to this worker. Message format is 
// entirely dependent on agreement between the FCS and worker implementation.
function onGCSMessage(msg) {
    d(`onGCSMessage(): msg.id=${msg.id}`);

    const result = {
        ok: true
    };

    switch(msg.id) {
        case "draw_circle": { sendDrawCircleMessage(); break; }
        case "draw_line": { sendDrawLineMessage(); break; }
        case "draw_poly": { sendDrawPolyMessage(); break; }
        case "clear_all": { sendClearAllMessage(); break; }

        default: {
            result.ok = false;
            result.message = `No message with id ${msg.id}`;
            break;
        }
    }

    return result;
}

//
// Return a UI for the specified screen.
//
function onScreenEnter(screen) {
    switch(screen) {
        case ATTRS.api.WorkerUI.Const.SCREEN_MAP: {
            const body = loadLayoutFor("map_panels");

            return (body)? {
                screen_id: screen, 
                map_bottom: body.command_buttons
            }: null;
        }

        default: {
            return null;
        }
    }
}

function onScreenExit(screen) {

}

function loadLayoutFor(panel) {
    return ATTRS.api.WorkerUI.loadLayout(__dirname, panel);
}

function sendDrawCircleMessage() {
    if(!mHere) return toast("no current location");

    ATTRS.sendGCSMessage(ATTRS.id, ATTRS.api.MapDraw.circleDraw(mHere, 20, "green", "#66ff00ff", "my_circle"));
}

function sendDrawLineMessage() {
    if(!mLastPath) return toast("no path");

    ATTRS.sendGCSMessage(ATTRS.id, ATTRS.api.MapDraw.lineAdd(mLastPath, "#ddff00ff", 2, "my_path"));

    mLastPath = null;
}

function sendDrawPolyMessage() {
    if(!mHere) return toast("no current location");

    const points = [];

    // Fake some points
    for(let i = 0; i < 360; i += 90) {
        points.push(ATTRS.api.MathUtils.newCoordFromBearingAndDistance(mHere, i, 50));
    }

    ATTRS.sendGCSMessage(ATTRS.id, ATTRS.api.MapDraw.polyDraw(points, "yellow", "#44ffff00", "my_poly"));
}

function sendClearAllMessage() {
    ATTRS.sendGCSMessage(ATTRS.id, ATTRS.api.MapDraw.clearAll());
}

function toast(msg) {
    ATTRS.sendGCSMessage(ATTRS.id, { id: "toast", text: msg });
}

function onVehicleMoved(where) {
//    d(`onVehicleMoved(): where=${JSON.stringify(where)}`);
    const here = mHere;
    
    mHere = where;

    if (mLastPath) {
        // Accumulate sensibly-spaced locations
        if(ATTRS.api.MathUtils.getDistance2D(here, where) >= 2) {
            mLastPath.push(mHere);
        }
    } else {
        mLastPath = [mHere];
    }
}

exports.getAttributes = getAttributes;
exports.loop = loop;
exports.onLoad = onLoad;
exports.onUnload = onUnload;
exports.onMavlinkMessage = onMavlinkMessage;
exports.onGCSMessage = onGCSMessage;
exports.onScreenEnter = onScreenEnter;
exports.onScreenExit = onScreenExit;

