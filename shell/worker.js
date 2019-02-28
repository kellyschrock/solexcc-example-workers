'use strict';

const spawn = require("child_process").spawn;
const path = require("path");
const utils = require("./ui-utils.js");

const ATTRS = {
    id: "shell",
    // Name/description
    name: "Shell demo",
    description: "Runs a command in a shell and provides a worker interface",
    // Does this worker want to loop?
    looper: false,
    // Mavlink messages we're interested in
    mavlinkMessages: []
};

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
    d(`onGCSMessage(): msg=${JSON.stringify(msg)}`);

    const result = {
        ok: true
    };

    switch(msg.id) {
        case "start": {
            return startShellProcess();
        }

        case "stop": {
            return stopShellProcess();
        }

        case "speak": { 
            return shellCommand({command: msg.id});
        }
    }

    return result;
}

var mChildProcess = null;

function startShellProcess() {
    d(`startShellProcess()`);

    if(mChildProcess) {
        d(`Child process is already running`);
        return {ok: false, message: "Child process is already running"};
    }

    const server = path.join(__dirname, "server.py");
    d(`server=${server}`);

    const child = spawn("python", [ server ], { shell: true });
    child.stdin.setEncoding("utf-8");
    d(`child=${child}`);

    child.on("error", function (error) {
        d(`Error starting child process: ${error}`);
    });

    child.stdout.on("data", function(data) {
        d(`child.stdout: ${data.toString('utf-8')}`);

        ATTRS.sendGCSMessage(ATTRS.id, {
            id: "speech",
            text: data.toString('utf-8')
        });
    });

    child.stderr.on("data", function(data) {
        d(`child.stderr: ${data.toString('utf-8')}`);
    });

    child.on("close", function(code) {
        d(`Child closed with ${code}`);
        mChildProcess = null;
    });

    mChildProcess = child;

    return {ok: true, message: "started"};
}

function stopShellProcess() {
    d(`stopShellProcess()`);

    if(!mChildProcess) {
        d(`Child process is not running`);
        return { ok: false, message: "Child process is not running" };
    }

    shellCommand({command: "quit"});

    return { ok: true, message: "stopped" };
}

function shellCommand(msg) {
    d(`shellCommand(${JSON.stringify(msg)})`);

    if(!mChildProcess) {
        return { ok: false, message: "Child process is not running" };
    }

    if(!msg.command) {
        return { ok: false, message: "Missing command" };
    }

    d(`Send command ${msg.command}`);
    mChildProcess.stdin.write(`${msg.command}\n`);

    return { ok: true, message: "sent" };
}

function onRosterChanged() {
    d("Roster has been changed");
}

function onScreenEnter(screen) {
    switch (screen) {
        case utils.Const.SCREEN_COMMANDS: {
            const body = utils.loadLayout(__dirname, utils.Const.PANEL_WORKER_FLIGHT_BUTTONS);

            if (body) {
                if (body) {
                    return {
                        screen_id: screen,
                        worker_flight_buttons: body
                    };
                } else {
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

exports.getAttributes = getAttributes;
exports.loop = loop;
exports.onLoad = onLoad;
exports.onUnload = onUnload;
exports.onMavlinkMessage = onMavlinkMessage;
exports.onGCSMessage = onGCSMessage;
exports.onRosterChanged = onRosterChanged;
exports.onScreenEnter = onScreenEnter;

if(process.mainModule === module) {
    startShellProcess();
}

