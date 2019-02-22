'use strict';

const utils = require("../ui/common/ui-utils");
const MathUtils = require("./MathUtils");

const ATTRS = {
    id: "map_draw",
    // Name/description
    name: "Map Draw",
    description: "Draws shapes on the map",
    // Does this worker want to loop?
    looper: false,
    // Mavlink messages we're interested in
    mavlinkMessages: ["GLOBAL_POSITION_INT", "ATTITUDE"]
};

var mHere = null;
var mLastPath = null;

function d(str) {
    ATTRS.log(ATTRS.id, str);
}

/*
Return an object describing this worker. If looper is true, this module must expose a loop() export.
*/
function getAttributes() {
    return ATTRS;
}

// Called from dispatch.loop()
function loop() {
}

// Called when this worker is loaded.
function onLoad() {
    d("onLoad()");
}

// Called when unloading
function onUnload() {
    d("onUnload()");
}

// Called when a Mavlink message arrives
function onMavlinkMessage(msg) {
    d(`onMavlinkMessage(): msg.name=$msg.name`);

    switch(msg.name) {
        case "GLOBAL_POSITION_INT": {
            mHere = {
                time: msg.time_boot_ms,
                lat: msg.lat / 1e7,
                lng: msg.lon / 1e7,
                alt: msg.alt / 1000
            };

            if(mLastPath) {
                mLastPath.push(mHere);
            } else {
                mLastPath = [mHere];
            }

            d(`here=${JSON.stringify(mHere)}`);
            break;
        }

        case "ATTITUDE": {
            mAttitude = {
                pitch: msg.pitch,
                roll: msg.roll,
                yaw: msg.yaw
            };
            break;
        }
    }
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
        case utils.Const.SCREEN_MAP: {
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
    return utils.loadLayout(__dirname, panel);
}

function sendDrawCircleMessage() {
    if(!mHere) return toast("no current location");

    ATTRS.sendGCSMessage(ATTRS.id, {
        id: "map_draw_circle",
        center: mHere,
        radius: 12,
        border_color: "green",
        fill_color: "#8800ff00"
    });
}

function sendDrawLineMessage() {
    if(!mLastPath) return toast("no path");

    ATTRS.sendGCSMessage(ATTRS.id, {
        id: "map_draw_line",
        points: mLastPath,
        color: "#ddff00ff",
        width: 2
    });

    mLastPath = null;
}

function sendDrawPolyMessage() {
    if(!mHere) return toast("no current location");

    const points = [];

    for(let i = 0; i < 360; i += 90) {
        points.push(MathUtils.newCoordFromBearingAndDistance(mHere, i, 20));
    }

    ATTRS.sendGCSMessage(ATTRS.id, {
        id: "map_draw_polygon",
        points: points,
        border_color: "yellow",
        fill_color: "#77dfce00"
    });
}

function sendClearAllMessage() {
    ATTRS.sendGCSMessage(ATTRS.id, {
        id: "map_clear_all"
    });
}

function toast(msg) {
    ATTRS.sendGCSMessage(ATTRS.id, { id: "toast", text: msg });
}

/**
 * Called when the worker roster (the list of installed workers) is changed.
 * If a worker needs to communicate with other workers, this is an opportunity to
 * check whether workers it needs to interact with are available.
 */
function onRosterChanged() {
    d("Roster has been changed");
}

exports.getAttributes = getAttributes;
exports.loop = loop;
exports.onLoad = onLoad;
exports.onUnload = onUnload;
exports.onMavlinkMessage = onMavlinkMessage;
exports.onGCSMessage = onGCSMessage;
exports.onRosterChanged = onRosterChanged;
exports.onScreenEnter = onScreenEnter;
exports.onScreenExit = onScreenExit;

