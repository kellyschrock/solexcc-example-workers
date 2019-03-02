'use strict';

const ATTRS = {
    id: "phasers",
    // Name/description
    name: "Phasers",
    description: "Fictional phaser functionality",
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
    d(`onGCSMessage(): msg.id=${msg.id}`);

    const result = {
        ok: true
    };

    switch(msg.id) {
        case "toggle_power": {
            if(mPhasersArmed) {
                armPhasers();
                result.content = { status: "Powered down" };
            } else {
                disarmPhasers();
                result.content = { status: "Powered up" };
            }

            sendPhaserButtonUpdate();
            break;
        }

        case "set_mode": {
            ATTRS.api.WorkerUI.sendSpeechMessage(ATTRS, `Phasers set to ${msg.phaser_mode}`);
            break;
        }

        case "fire": {
            firePhasers(msg);
            result.content = { status: "Fired" };
            break;
        }

        case "open_phasers_panel": {
            sendPhaserPanelDisplayMessage();
            break;
        }

        case "update_intensity": {
            sendIntensityUpdateMessage(msg);
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
        case ATTRS.api.WorkerUI.Const.SCREEN_START: {
            const buttonText = (mPhasersArmed)? "Disarm": "Arm";
            const buttonColor = (mPhasersArmed) ? "#ff0000aa" : "#ffaa0000";

            const body = loadLayoutFor(ATTRS.api.WorkerUI.Const.PANEL_WORKER_BUTTONS);

            if(body) {
                body.children[1].text = buttonText;
                body.children[1].background = buttonColor;

                return {
                    screen_id: screen,
                    worker_buttons: body
                };
            } else {
                return null;
            }
        }

        case ATTRS.api.WorkerUI.Const.SCREEN_FLIGHT: {
            if(mPhasersArmed) {
                const body = loadLayoutFor(ATTRS.api.WorkerUI.Const.PANEL_WORKER_SHOT_BUTTONS);

                if(body) {
                    return {
                        screen_id: screen,
                        worker_shot_buttons: body,
                        worker_status: loadLayoutFor(ATTRS.api.WorkerUI.Const.PANEL_WORKER_STATUS)
                    };
                } else {
                    return null;
                }
            }
        }
    }
}

function onScreenExit(screen) {

}

function loadLayoutFor(panel) {
    return ATTRS.api.WorkerUI.loadLayout(__dirname, panel);
}

// Serve an image if it exists.
function onImageDownload(name) {
    return ATTRS.api.WorkerUI.serveImage(__dirname, name);
}

/**
 * Called when the worker roster (the list of installed workers) is changed.
 * If a worker needs to communicate with other workers, this is an opportunity to
 * check whether workers it needs to interact with are available.
 */
function onRosterChanged() {
    d("Roster has been changed");
}

var mPhasersArmed = false;

function disarmPhasers() {
    mPhasersArmed = true;
}

function armPhasers() {
    mPhasersArmed = false;
}

function firePhasers(msg) {
    ATTRS.api.WorkerUI.sendSpeechMessage(ATTRS, "Kaboom", "text");

    // Update the phasers screen.
    ATTRS.sendGCSMessage(ATTRS.id, {
        id: "screen_update",
        screen_id: "flight",
        panel_id: "phasers_screen",
        values: {
            prompt_text: {
                text: "Oops, missed",
                textColor: "red",
                shadow: { radius: 12, dx: 2, dy: 2, color: "yellow" }
            }
        }
    });

    setTimeout(function() {
        ATTRS.sendGCSMessage(ATTRS.id, {
            id: "screen_update",
            screen_id: "flight",
            panel_id: "phasers_screen",
            values: {
                prompt_text: {
                    text: "Try again",
                    textColor: "black",
                    shadow: { radius: 2, dx: 2, dy: 2, color: "red" }
                }
            }
        });
    }, 3000);
}

function sendPhaserButtonUpdate() {
    const buttonText = (mPhasersArmed)? "Disarm": "Arm";
    const buttonColor = (mPhasersArmed)? "#ff0000aa": "#ffaa0000";

    ATTRS.sendGCSMessage(ATTRS.id, {
        id: "screen_update",
        screen_id: "start",
        panel_id: "worker_buttons",
        values: {
            phaser_power: {
                text: buttonText,
                background: buttonColor
            }
        }
    });
}

function sendIntensityUpdateMessage(msg) {
    const intensity = msg.intensity || 50;

    ATTRS.sendGCSMessage(ATTRS.id, {
        id: "screen_update",
        screen_id: "flight",
        panel_id: "phasers_screen",
        values: {
            intensity_text: {
                text: `Intensity: ${intensity}`
            }
        }
    });
}

function sendPhaserPanelDisplayMessage() {
    const body = loadLayoutFor("phaser_panel");

    if(body) {
        ATTRS.sendGCSMessage(ATTRS.id, {
                id: "display_fullscreen",
                content: body
            }
        );
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

