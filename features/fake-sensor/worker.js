'use strict';

const ATTRS = {
    id: "fake_sensor",
    // Name/description
    name: "Fake Sensor",
    description: "Demonstrates a sub-feature with mission actions",
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

function onGCSMessage(msg) {
    d(`onGCSMessage(): msg.id=${msg.id}`);

    const result = {
        ok: true
    };

    return result;
}

function onRosterChanged() {
    d("Roster has been changed");
}

function getMissionItemSupport(workerId) {
    return {
        id: ATTRS.id,
        name: ATTRS.name,
        actions: [
            { 
                id: "start", 
                name: "Start", 
                msg_id: "start", 
                params: [
                    { 
                        id: "sample_rate", 
                        name: "Sample rate", 
                        type: "int", 
                        min: 10, max: 100, default: 20
                    },
                    { id: "depth", name: "Sensor depth", type: "decimal", default: 16.9 }
                ]
            },
            { id: "stop", name: "Stop", msg_id: "stop" }
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
exports.getMissionItemSupport = getMissionItemSupport;
