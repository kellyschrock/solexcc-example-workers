'use strict';

const ATTRS = {
    id: "video",
    // Name/description
    name: "Video",
    description: "Video screen example",
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
    d("onLoad()");
}

// Called when unloading
function onUnload() {
    d("onUnload()");
}

// Called when a Mavlink message arrives
function onMavlinkMessage(msg) {
    d(`onMavlinkMessage(): msg.name=${msg.name}`);
}

// Called when the GCS sends a message to this worker. Message format is 
// entirely dependent on agreement between the FCS and worker implementation.
function onGCSMessage(msg) {
    d(`onGCSMessage(): msg.id=${msg.id}`);

    const result = {
        ok: true
    };

    switch(msg.id) {
        case "say_something": {
            ATTRS.api.WorkerUI.sendSpeechMessage(ATTRS, "Hey stop it", ATTRS.api.WorkerUI.SpeechType.TEXT);
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
        case ATTRS.api.WorkerUI.Const.SCREEN_VIDEO: {
            const body = loadLayoutFor("video_panels");

            return (body)? {
                screen_id: screen, 
                video_main: body.video_main,
                video_bottom: body.video_bottom
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

