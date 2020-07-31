'use strict';

const ATTRS = {
    id: "speech",
    // Name/description
    name: "Speech",
    description: "Speech example",
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
        case "say_text": {
            ATTRS.api.WorkerUI.sendSpeechMessage(ATTRS, "Hello", ATTRS.api.WorkerUI.SpeechType.TEXT);
            break;
        }

        case "say_tts": {
            ATTRS.api.WorkerUI.sendSpeechMessage(ATTRS, "Just a normal TTS phrase");
            break;
        }

        case "say_error": {
            ATTRS.api.WorkerUI.sendSpeechMessage(ATTRS, "Something bad has happened", ATTRS.api.WorkerUI.SpeechType.ERROR);
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
function onScreenEnter(screen, type) {
    switch(type) {
        case "html": {
            return {
                screen_id: screen,
                worker_shot_buttons: loadHTMLLayoutFor("worker_shot_buttons")
            };
        }
        
        default: {
            switch (screen) {
                case ATTRS.api.WorkerUI.Const.SCREEN_FLIGHT: {
                    const body = loadLayoutFor(ATTRS.api.WorkerUI.Const.PANEL_WORKER_SHOT_BUTTONS);

                    return (body) ? {
                        screen_id: screen,
                        worker_shot_buttons: body
                    } : null;
                }

                default: {
                    return null;
                }
            }
        }
    }
}

function onScreenExit(screen) {

}

function loadHTMLLayoutFor(panel) {
    const fs = require("fs");
    const path = require("path");

    const file = path.join(path.join(__dirname, "ui"), `${panel}.html`);
    d(`load: ${panel}: file=${file}`);

    if(fs.existsSync(file)) {
        try {
            const content = fs.readFileSync(file);
            return content.toString("utf8");
        } catch(ex) {
            console.error(ex.message);
        }
    }

    return null;
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

