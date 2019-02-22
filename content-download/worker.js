'use strict';

const utils = require("../ui/common/ui-utils");

const ATTRS = {
    id: "content_download",
    // Name/description
    name: "Content Download",
    description: "Content download example",
    // Does this worker want to loop?
    looper: false,
    // Mavlink messages we're interested in
    mavlinkMessages: []
};

function d(str) {
    ATTRS.log(ATTRS.id, str);
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

function onMavlinkMessage(msg) {
    d(`onMavlinkMessage(): msg.name=$msg.name`);
}

// Called when the GCS sends a message to this worker. Message format is 
// entirely dependent on agreement between the FCS and worker implementation.
function onGCSMessage(msg) {
    d(`onGCSMessage(): msg=${JSON.stringify(msg)}`);

    const result = {
        ok: true
    };

    switch(msg.id) {
        case "open_content_dialog": {
            // Open a dialog to let the user pick something to download.
            ATTRS.sendGCSMessage(ATTRS.id, {
                id: "content_dialog",
                dialog_id: "dlg_content_download",
                title: "Download some Content",
                text: "Pick some content to download.",
                list_items: [
                    {id: "item1", text: "Item 1", msg_id: "do_item_download"},
                    {id: "item2", text: "Item 2", msg_id: "do_item_download"},
                    {id: "item3", text: "Item 3", msg_id: "do_item_download"},
                    {id: "item4", text: "Item 4", msg_id: "do_item_download"},
                    {id: "item5", text: "Item 5", msg_id: "do_item_download"},
                    {id: "item6", text: "Item 6", msg_id: "do_item_download"},
                    {id: "item7", text: "Item 7", msg_id: "do_item_download"}
                ]
            });

            break;
        }

        case "do_item_download": {
            switch(msg.dialog_id) {
                // Filter for our content dialog (could support multiple ones from one worker)
                case "dlg_content_download": {
                    ATTRS.sendGCSMessage(ATTRS.id, {
                        id: "content_download",
                        mime_type: "text/plain",
                        filename: `${msg.item_id}.txt`,
                        msg_id: "get_dialog_content",
                        content_id: msg.item_id
                    });

                    break;
                }
            }

            break;
        }

        case "do_content_download": {
            ATTRS.sendGCSMessage(ATTRS.id, {
                id: "content_download",
                mime_type: "text/plain",
                filename: "demofile.txt",
                msg_id: "get_content",
                content_id: "demofile"
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
        case utils.Const.SCREEN_START: {
            const body = loadLayoutFor("worker_buttons");

            return (body)? {
                screen_id: screen, 
                worker_buttons: body
            }: null;
        }

        case utils.Const.SCREEN_FLIGHT: {
            const body = loadLayoutFor("worker_shot_buttons");

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
    return utils.loadLayout(__dirname, panel);
}

/**
 * Called with the msg_id and content_id specified in the content_download WS message.
 * Triggers a download on the part of the client to retrieve file data from the CC,
 * as specified by a worker.
 */
function onContentDownload(msgId, contentId) {
    d(`onContentDownload(${msgId}, ${contentId})`);

    switch(msgId) {
        case "get_dialog_content": {
            return `This is content resulting from picking ${contentId} from a list of things to download.`;
        }

        case "get_content": {
            // Take action based on content id
            switch (contentId) {
                case "demofile": {
                    return "This is the contents of demofile. It's really important";
                }

                case "some_other_content": {
                    return "Some other content";
                }

                default: {
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
exports.onContentDownload = onContentDownload;
