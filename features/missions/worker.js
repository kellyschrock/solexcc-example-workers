'use strict';

const ATTRS = {
    id: "missions",
    // Name/description
    name: "Missions Support",
    description: "Mission Support (features/mavlink demo)",
    // Does this worker want to loop?
    looper: false,
    // Mavlink messages we're interested in
    mavlinkMessages: []
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

/*
Message looks like this:

    {
        "id":"upload_mission",
        "action_map":[
            {"index":4,"actions":[
                    {"worker_id":"camera","id":"photo"}
                ]
            },
            {"index":6,"actions":[
                    {"worker_id":"fake_lights","id":"off"}
                ]
            },
            {"index":0,"actions":[
                    {"worker_id":"fake_lights","id":"on","params":{"brightness":64,"color":"green"}}
                ]
            }
        ]
    }

*/
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

exports.getAttributes = getAttributes;
exports.loop = loop;
exports.onLoad = onLoad;
exports.onUnload = onUnload;
exports.onMavlinkMessage = onMavlinkMessage;
exports.onGCSMessage = onGCSMessage;
exports.onRosterChanged = onRosterChanged;
exports.getFeatures = getFeatures;

function testMapping() {
    const d = {
        action_map: [
            {index: 20, actions: [{id: "a", name: "derp" }]},
            {index: 12, actions: [{id: "b", name: "derp2" }]},
            {index: 96, actions: [{id: "c", name: "derp3" }]}
        ]
    }

    loadActionMap(d);
}

if(process.mainModule === module) {
    testMapping();
}
