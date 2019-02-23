'use strict';

const ATTRS = {
    id: "fake_lights",
    // Name/description
    name: "Fake Lights",
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
                id: "on", 
                name: "On", 
                msg_id: "lights_on", 
                params: [
                    {id: "brightness", name: "Brightness", type: "int", min: 10, max: 100, default: 50 },
                    {
                        id: "color", 
                        name: "Color", 
                        type: "enum", 
                        values: [
                            {id: "white", name: "White"},
                            {id: "red", name: "Red"},
                            {id: "green", name: "Green"},
                            {id: "yellow", name: "Yellow"},
                        ], 
                        default: "red" 
                    }
                ]
            },
            { id: "off", name: "Off", msg_id: "off" }
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
