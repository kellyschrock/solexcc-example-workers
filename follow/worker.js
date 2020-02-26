'use strict';

const ATTRS = {
    id: "follow",
    // Name/description
    name: "Follow",
    description: "Follow example",
    // Does this worker want to loop?
    looper: false,
    // Mavlink messages we're interested in
    mavlinkMessages: []
};

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
        case "start": {
            ATTRS.sendGCSMessage(ATTRS.id, { 
                id: "follow_send_locations", 
                action: "start",
                msg_id: "follow_location"
            });

            break;
        }

        case "stop": {
            ATTRS.sendGCSMessage(ATTRS.id, {
                id: "follow_send_locations",
                action: "stop",
                msg_id: "follow_location"
            });

            ATTRS.sendGCSMessage(ATTRS.id, ATTRS.api.MapDraw.clearAll());

            break;
        }

        case "follow_location": {
            // The message we specified as the msg_id in the "start" message processing. It can have any value.
            onFollowLocation(msg);
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

function onFollowLocation(msg) {
    d(`onFollowLocation(): ${JSON.stringify(msg)}`);

    ATTRS.sendGCSMessage(ATTRS.id, ATTRS.api.MapDraw.circleClear("my_circle"));
    ATTRS.sendGCSMessage(ATTRS.id, ATTRS.api.MapDraw.circleDraw(msg, 20, "green", "#66ff00ff", "my_circle"));
}

//
// Return a UI for the specified screen.
//
function onScreenEnter(screen) {
    switch(screen) {
        case ATTRS.api.WorkerUI.Const.SCREEN_FLIGHT: {
            const body = loadLayoutFor(ATTRS.api.WorkerUI.Const.PANEL_WORKER_SHOT_BUTTONS);

            return (body)? {
                screen_id: screen, 
                worker_shot_buttons: body
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

exports.getAttributes = getAttributes;
exports.loop = loop;
exports.onLoad = onLoad;
exports.onUnload = onUnload;
exports.onMavlinkMessage = onMavlinkMessage;
exports.onGCSMessage = onGCSMessage;
exports.onScreenEnter = onScreenEnter;
exports.onScreenExit = onScreenExit;

