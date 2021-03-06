'use strict';

const ATTRS = {
    id: "left_panel",
    // Name/description
    name: "Left Panel",
    description: "Example of controls on the left panel in the flight screen",
    // Does this worker want to loop?
    looper: false,
    // Mavlink messages we're interested in
    mavlinkMessages: []
};

// Some kind of fake internal state
var mLightsOn = false;

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
}

// Called when the GCS sends a message to this worker. Message format is 
// entirely dependent on agreement between the FCS and worker implementation.
function onGCSMessage(msg) {
    d(`onGCSMessage(): msg.id=${msg.id}`);

    const result = {
        ok: true
    };

    switch(msg.id) {
        case "land_now": {
            ATTRS.api.WorkerUI.sendSpeechMessage(ATTRS, "Mode land", ATTRS.api.WorkerUI.SpeechType.TEXT);
            break;
        }

        case "set_lights": {
            const word = (msg.lights)? "on": "off";
            mLightsOn = msg.lights;

            ATTRS.api.WorkerUI.sendSpeechMessage(ATTRS, `lights ${word}`, ATTRS.api.WorkerUI.SpeechType.TEXT);
            break;
        }

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
        case ATTRS.api.WorkerUI.Const.SCREEN_COMMANDS: {
            const body = loadLayoutFor(ATTRS.api.WorkerUI.Const.PANEL_WORKER_FLIGHT_BUTTONS);

            if (body) {
                if (body) {
                    const button = ATTRS.api.WorkerUI.findViewById(body, "sw_lights");
                    if(button) {
                        button.checked = mLightsOn;
                    }
                    
                    return {
                        screen_id: screen,
                        worker_flight_buttons: body
                    };
                } else {
                    return null;
                }
            }
            break;
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

exports.getAttributes = getAttributes;
exports.loop = loop;
exports.onLoad = onLoad;
exports.onUnload = onUnload;
exports.onMavlinkMessage = onMavlinkMessage;
exports.onGCSMessage = onGCSMessage;
exports.onScreenEnter = onScreenEnter;
exports.onScreenExit = onScreenExit;

