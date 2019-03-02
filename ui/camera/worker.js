'use strict';

const camera = require("./camera.js");

const ATTRS = {
    id: "camera",
    // Name/description
    name: "Camera",
    description: "Example Camera control",
    // Does this worker want to loop?
    looper: false,
    // Mavlink messages we're interested in
    mavlinkMessages: []
};

let api = null;

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
    api = ATTRS.api;
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
    d(`onGCSMessage(): msg.id=${JSON.stringify(msg)}`);

    const result = {
        ok: true
    };

    switch(msg.id) {
        case "take_picture": {
            camera.takePicture(function(err) {
                if(err) {
                    result.ok = false;
                    sendCameraError(err.message);
                }
            });
            break;
        }

        case "toggle_video": {
            camera.toggleVideo(function(err, recording) {
                if(err) {
                    result.ok = false;
                    sendCameraError("Failed to toggle video");
                } else {
                    sendUpdateRecordingStatus(recording);
                }
            });
            break;
        }

        case "open_settings": {
            sendSettingsDialogMessage();
            break;
        }

        case "evcomp_up": {
            camera.incrementEVComp(function(err, evcomp) {
                if(err) {
                    sendCameraError(err.message);
                } else {
                    sendEVCompUpdate(evcomp);
                }
            });
            break;
        }

        case "evcomp_down": {
            camera.decrementEVComp(function(err, evcomp) {
                if(err) {
                    sendCameraError(err.message);
                } else {
                    sendEVCompUpdate(evcomp);
                }
            });
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
        case api.WorkerUI.Const.SCREEN_FLIGHT: {
            const body = api.WorkerUI.loadLayout(__dirname, api.WorkerUI.Const.PANEL_CAMERA);

            return (body)? {
                screen_id: screen, 
                camera_panel: body
            }: null;
        }

        default: {
            return null;
        }
    }
}

function onScreenExit(screen) {

}

// Serve an image if it exists.
function onImageDownload(name) {
    return api.WorkerUI.serveImage(__dirname, name);
}

function sendCameraError(str) {
    api.WorkerUI.sendSpeechMessage(ATTRS, str, api.WorkerUI.SpeechType.ERROR);
}

function sendUpdateRecordingStatus(recording) {
    const imgName = (recording) ? "record_on.png" : "record_off.png";

    ATTRS.sendGCSMessage(ATTRS.id, {
        id: "screen_update",
        screen_id: "flight",
        panel_id: "camera_panel",
        values: {
            btn_video: {
                icon: `$(img)/${ATTRS.id}/${imgName}`
            },
            spin_frame_rate: { enabled: !recording },
            btn_evcomp_add: { enabled: !recording },
            btn_evcomp_sub: { enabled: !recording }
        }
    });
}

function sendSettingsDialogMessage() {
    const body = api.WorkerUI.loadLayout(__dirname, "camera_settings");
    if (body) {
        ATTRS.sendGCSMessage(ATTRS.id, { id: "display_dialog", content: body });
    }
}

function sendEVCompUpdate(evcomp) {
    ATTRS.sendGCSMessage(ATTRS.id, {
        id: "screen_update",
        screen_id: "flight",
        panel_id: "camera_panel",
        values: {
            txt_evcomp: {
                text: evcomp.toFixed(2)
            }
        }
    });
}

/**
 * Called when the worker roster (the list of installed workers) is changed.
 * If a worker needs to communicate with other workers, this is an opportunity to
 * check whether workers it needs to interact with are available.
 */
function onRosterChanged() {
    d("Roster has been changed");
}

function getMissionItemSupport(workerId) {
    return {
        id: ATTRS.id,
        name: ATTRS.name,
        actions: [
            { 
                id: "video_start", 
                name: "Start Video", 
                msg_id: "video_start", 
                params: [
                    {id: "frame_rate", name: "Frame rate", type: "enum", values: [
                        {id: "low", name: "Low"},
                        {id: "med", name: "Medium"},
                        {id: "hi", name: "High"}
                    ], 
                    default: "med"}
                ]
            },
            { id: "video_stop", name: "Stop Video", msg_id: "video_stop" },
            { id: "photo", name: "Take Photo", msg_id: "take_photo" },
        ]
    }
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
exports.onImageDownload = onImageDownload;
exports.getMissionItemSupport = getMissionItemSupport;

