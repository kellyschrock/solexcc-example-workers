'use strict';

const ATTRS = {
    id: "start_panel",
    // Name/description
    name: "Start Panel",
    description: "Buttons on the start panel",
    // Does this worker want to loop?
    looper: true,
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

let loopIterations = 0;

// Called from dispatch.loop()
function loop() {
    if(++loopIterations > 8) {
        d(`Send time update message`);
        sendTimeUpdateMessage();
        loopIterations = 0;
    }
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
        case "show_dialog": {
            sendShowDialogMessage();
            break;
        }

        case "show_progress": {
            d(JSON.stringify(msg));

            ATTRS.sendGCSMessage(ATTRS.id, {
                id: "screen_update",
                screen_id: "start",
                panel_id: "my_fullscreen",
                values: {
                    progress_something: { progress: msg.demo_progress}
                }
            });

            break;
        }

        case "message_dialog": {
            sendMessageDialogMessage();
            break;
        }

        case "show_fullscreen": {
            sendShowFullscreenMessage();
            break;
        }

        case "my_dialog_ok": {
            d(`message is ${JSON.stringify(msg)}`);
            break;
        }

        case "show_edit_values": {
            ATTRS.api.WorkerUI.sendToastMessage(ATTRS, JSON.stringify(msg), ATTRS.api.WorkerUI.ToastLength.LONG);
            break;
        }

        case "start_screen_abort": {
            // Fullscreen view shown on the start screen was backed out of.
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

// Return a UI for the specified screen.
function onScreenEnter(screen) {
    switch(screen) {
        case ATTRS.api.WorkerUI.Const.SCREEN_START: {
            const body = loadLayoutFor(ATTRS.api.WorkerUI.Const.PANEL_WORKER_BUTTONS);

            return (body)? {
                screen_id: screen, 
                worker_buttons: body
            }: null;
        }

        default: {
            return null;
        }
    }
}

function onScreenExit(screen) {

}

function onImageDownload(name) {
    return ATTRS.api.WorkerUI.serveImage(__dirname, name);
}

function sendShowDialogMessage() {
    const body = loadLayoutFor("display_dialog");

    if(body) {
        ATTRS.sendGCSMessage(ATTRS.id, { id: "display_dialog", content: body });
    }
}

function sendMessageDialogMessage() {
    const body = loadLayoutFor("message_dialog");

    if(body) {
        ATTRS.sendGCSMessage(ATTRS.id, { id: "display_dialog", content: body });
    }
}

function sendShowFullscreenMessage() {
    const body = loadLayoutFor("display_fullscreen");

    if (body) {
        ATTRS.sendGCSMessage(ATTRS.id, { id: "display_fullscreen", content: body });
    }
}

function sendTimeUpdateMessage() {
    ATTRS.sendGCSMessage(ATTRS.id, {
        id: "screen_update",
        screen_id: "start",
        panel_id: "worker_buttons",
        values: {
            current_time: {
                text: formatDate(new Date())
            }
        }
    });
}

function formatDate(d) {
    return d.toLocaleTimeString();
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
exports.onImageDownload = onImageDownload;

