'use strict';

const ATTRS = {
    id: "video_support",
    // Name/description
    name: "Video Support",
    description: "Video Support feature",
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

function getFeatures() {
    d("getFeatures()");
    
    // Return a single feature, or multiple
    return {
        video: { 
            supported: true,
            ports: [5600, 5601]
        }
    };
}

exports.getAttributes = getAttributes;
exports.loop = loop;
exports.onLoad = onLoad;
exports.onUnload = onUnload;
exports.onMavlinkMessage = onMavlinkMessage;
exports.onGCSMessage = onGCSMessage;
exports.onRosterChanged = onRosterChanged;
exports.getFeatures = getFeatures;

