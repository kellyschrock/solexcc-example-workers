'use strict';

const ATTRS = {
    id: "joystick",
    // Name/description
    name: "Joystick support",
    description: "Joystick support",
    // Does this worker want to loop?
    looper: false,
    // Mavlink messages we're interested in
    mavlinkMessages: []
};

const VERBOSE = true;

function d(str) {
    if(!VERBOSE) return;

    if(process.mainModule === module) {
        console.log(str);
    } else {
        ATTRS.log(ATTRS.id, str);
    }
}

function getAttributes() {
    return ATTRS;
}

function loop() {
}

function onLoad() {
    d("onLoad()");
}

function onUnload() {
    d("onUnload()");
}

function onMavlinkMessage(msg) { }

function onGCSMessage(msg) {
    // d(`onGCSMessage(): msg.id=${msg.id}`);

    const result = {
        ok: true
    };

    switch(msg.id) {
        case "on_key_event": {
            onKeyEvent(msg);
            break;
        }

        case "on_motion_event": {
            onMotionEvent(msg);
            break;
        }
    }

    return result;
}

function onKeyEvent(msg) {
    d(JSON.stringify(msg));
}

function onMotionEvent(msg) {
    d(JSON.stringify(msg));
}

function onRosterChanged() {
    d("Roster has been changed");
}

function onBroadcastResponse(msg) {
    // d(`onBroadcastResponse(${JSON.stringify(msg)}`);

    if(msg.request) {
        switch(msg.request.type) {
            case "mission_item_support": {

                if(msg.response) {
                    if(!mMissionItemSupportWorkers) mMissionItemSupportWorkers = [];

                    mMissionItemSupportWorkers.push(msg.response);
                }

                break;
            }
        }
    }
}

function getFeatures() {
    d("getFeatures()");

    var output = {
        // Indicate this worker supports missions
        joystick: { 
            worker_id: ATTRS.id,
            key_event: "on_key_event",
            motion_event: "on_motion_event"
        }
    };

    return output;
}

exports.getAttributes = getAttributes;
exports.loop = loop;
exports.onLoad = onLoad;
exports.onUnload = onUnload;
exports.onMavlinkMessage = onMavlinkMessage;
exports.onGCSMessage = onGCSMessage;
exports.onRosterChanged = onRosterChanged;
exports.getFeatures = getFeatures;
exports.onBroadcastResponse = onBroadcastResponse;

if(process.mainModule === module) {
    d("Hi!");
}
