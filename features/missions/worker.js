'use strict';

const ATTRS = {
    id: "missions",
    // Name/description
    name: "Missions Support",
    description: "Mission Support (features/mavlink demo)",
    // Does this worker want to loop?
    looper: false,
    // Mavlink messages we're interested in
    mavlinkMessages: ["MISSION_ITEM_REACHED"]
};

const mMessageMap = {
    "MISSION_ITEM_REACHED": onMissionItemReached
};

const mActionMap = {};
var mMissionItemSupportWorkers = [];

function d(str) {
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

function onMavlinkMessage(msg) {
    d(`onMavlinkMessage(): msg.name=${msg.name}`);

    if(!msg) return;
    if(!msg.name) return;

    const func = mMessageMap[msg.name];
    if(func) {
        func(msg);
    }
}

function onGCSMessage(msg) {
    d(`onGCSMessage(): msg.id=${msg.id}`);

    const result = {
        ok: true
    };

    switch(msg.id) {
        case "upload_mission": {
            loadActionMap(msg);
            break;
        }
    }

    return result;
}

function loadActionMap(msg) {
    d(`loadActionMap(): ${JSON.stringify(msg)}`);

    for(let prop in mActionMap) {
        delete mActionMap[prop];
    }

    if(msg.action_map) {
        /* Restructure this so it looks like this:
        {
            1: actions: [],
            23: actions: []
        }
        */
        msg.action_map.map(function(item) {
            const index = item.index;
            const actions = item.actions;
            mActionMap[index] = actions;
        });

        d(`mActionMap=${JSON.stringify(mActionMap)}`);
    }
}

function onRosterChanged() {
    d("Roster has been changed");

    // Request mission item support info from other workers
    mMissionItemSupportWorkers = [];
    ATTRS.sendBroadcastRequest({ type: "mission_item_support" });
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
        mission: { 
            support_worker_id: ATTRS.id,
            upload_msg_id: "upload_mission",
            workers: mMissionItemSupportWorkers
        }
    };
    return output;
}

function onMissionItemReached(msg) {
    // Get the actions for this mission item.
    const actions = mActionMap[msg.seq];
    d(`actions for ${msg.seq}=${JSON.stringify(actions)}`);

    if(actions) {
        actions.map(function(action) {
            // Make a message to send to the worker
            const msg = {
                id: action.msg_id || action.id
            };

            if(action.params) {
                for(let prop in action.params) {
                    msg[prop] = action.params[prop];
                }
            }

            if(action.worker_id) {
                ATTRS.sendWorkerMessage(action.worker_id, msg);
            }
        });
    }
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
