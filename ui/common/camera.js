'use strict';

//
// Control a fictional camera
//
var mRecordingVideo = false;
var mEvComp = 0.0;

// exceptions
function CameraOnFireException() {
    this.message = "Camera is on fire";
}

function takePicture(callback) {
    callback(new CameraOnFireException());
}

function startVideo(callback) {
    mRecordingVideo = true;
    callback(null, mRecordingVideo);
}

function stopVideo(callback) {
    mRecordingVideo = false;
    callback(null, mRecordingVideo);
}

function toggleVideo(callback) {
    const func = (mRecordingVideo)?
        stopVideo: startVideo;

    func(callback);
}

function incrementEVComp(cb) {
    const newEvComp = mEvComp + 0.5;
    if(newEvComp <= 3.0) {
        mEvComp = newEvComp;
    }
    
    cb(null, mEvComp);
}

function decrementEVComp(cb) {
    const newEvComp = mEvComp - 0.5;
    if (newEvComp >= -3.0) {
        mEvComp = newEvComp;
    }

    cb(null, mEvComp);
}

exports.takePicture = takePicture;
exports.startVideo = startVideo;
exports.stopVideo = stopVideo;
exports.toggleVideo = toggleVideo;
exports.incrementEVComp = incrementEVComp;
exports.decrementEVComp = decrementEVComp;
