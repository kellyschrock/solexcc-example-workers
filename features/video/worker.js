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

function getFeatures() {
    d("getFeatures()");
    
    // Return a single feature, or multiple
    return {
        video: { 
            supported: true,
            endpoints: [
                {
                    name: "FPV", 
                    type: "rtsp",
                    url: "rtsp://192.168.1.67:8554/cam0"
                },
                {
                    name: "Fancy", 
                    type: "rtsp",
                    url: "rtsp://192.168.1.67:8554/cam4"
                },
                {
                    name: "UDP Test",
                    type: "udp",
                    ip: "192.168.1.67",
                    port: 5600
                }
            ]
        }
    };
}

exports.getAttributes = getAttributes;
exports.loop = loop;
exports.onLoad = onLoad;
exports.onUnload = onUnload;
exports.onMavlinkMessage = onMavlinkMessage;
exports.onGCSMessage = onGCSMessage;
exports.getFeatures = getFeatures;

