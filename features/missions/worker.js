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
    d(`onMavlinkMessage(): msg.name=$msg.name`);

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
}

function getFeatures() {
    d("getFeatures()");

    var output = {
        // Indicate this worker supports missions
        mission: { 
            support_worker_id: ATTRS.id,
            upload_msg_id: "upload_mission",
            workers: []
        }
    };
    
    // Call other workers with specific implementations to get features from them.
    // Fill out the mission/actions array
    const others = ATTRS.getWorkerRoster();

    if(others) {
        others.map(function(item) {
            const attrs = item.attributes;
            const worker = item.worker;
            d(`attrs=${attrs.id} item.enabled=${item.enabled}`);

            if(item.enabled && attrs && worker && worker.getMissionItemSupport) {
                const support = worker.getMissionItemSupport(ATTRS.id);
                if(support) {
                    output.mission.workers.push(support);
                }
            }
        });
    }

    return output;
}

function onMissionItemReached(msg) {
    const actions = mActionMap[msg.seq];
    if(actions) {
        actions.map(function(action) {
            // Make a message to send to the worker
            const msg = {
                id: action.id
            };

            if(action.params) {
                for(let prop in action.params) {
                    msg[prop] = action.params[prop];
                }
            }

            if(action.worker_id) {
                const worker = ATTRS.findWorkerById(action.worker_id);
                if(worker && worker.onGCSMessage) {
                    try {
                        worker.onGCSMessage(action);
                    } catch (ex) {
                        d("Error executing action: " + ex.message);
                    }
                }
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

if(process.mainModule === module) {
    d("Hi!");
}
