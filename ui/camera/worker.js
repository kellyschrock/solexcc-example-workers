'use strict';

const utils = require("../common/ui-utils");
const camera = require("../common/camera");

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
        case utils.Const.SCREEN_FLIGHT: {
            const body = utils.loadLayout(__dirname, utils.Const.PANEL_CAMERA);

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
    return utils.serveImage(__dirname, name);
}

function sendCameraError(str) {
    utils.sendSpeechMessage(ATTRS, str, utils.SpeechType.ERROR);
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
    const body = utils.loadLayout(__dirname, "camera_settings");
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

