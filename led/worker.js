'use strict';

const spawn = require("child_process").spawn;
const path = require("path");
const fs = require("fs");

const ATTRS = {
    id: "leds",
    // Name/description
    name: "LEDs",
    description: "Uses rpi_281x lib to control LEDs via Python scripts",
    // Does this worker want to loop?
    looper: false,
    // Mavlink messages we're interested in
    mavlinkMessages: []
};

var mMenuItems = {};

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

function loop() { }

function onLoad() {
    d("onLoad()");
    // TODO: Find all of the scripts under script/ and make a list of them.
    const dir = path.join(__dirname, "script");

    mMenuItems = {};

    if(!fs.existsSync(dir)) {
        d(`${dir} not found`);
        return;
    }

    const files = fs.readdirSync(dir);
    
    for(let i = 0, size = files.length; i < size; ++i) {
        const file = files[i];
        if(!file.endsWith(".py")) continue;

        const name = path.basename(file, ".py");
        mMenuItems[name] = { id: name, path: path.join(dir, file), is_default: ("default.py" === file) };
    }

    d(`mMenuItems=${JSON.stringify(mMenuItems)}`);
}

function onUnload() {
    d("onUnload()");

    // TODO: Call all-stop on scripts
}

function onMavlinkMessage(msg) {
    d(`onMavlinkMessage(): msg.name=$msg.name`);

    // TODO: Watch for mode change messages and derive the mode name from 
    // vehicle mode. call sendModeToLEDs(modename)
}

function onGCSMessage(msg) {
    d(`onGCSMessage(): msg=${JSON.stringify(msg)}`);

    const result = {
        ok: true
    };

    switch(msg.id) {
        // Display config dialog
        case "config_dialog": {
            sendContentDialogMsg();
            break;
        }

        // Run a script
        case "run_led": {
            stopShellProcess();

            return startShellProcess(msg.id);
        }

        // Stop the script
        case "stop_led": {
            stopShellProcess();
            break;
        }
    }

    return result;
}

var mChildProcess = null;

function startShellProcess(name) {
    d(`startShellProcess()`);

    if(mChildProcess) {
        d(`Child process is already running`);
        return {ok: false, message: "Child process is already running"};
    }

    const item = mMenuItems[name];
    if(!item) {
        d(`No item named ${name}`);
        return {ok: false, message: `No item named ${name}`};
    }

    const server = item.path;
    d(`server=${server}`);

    const child = spawn("python", [ server ], { shell: true });
    child.stdin.setEncoding("utf-8");
    d(`child=${child}`);

    child.on("error", function (error) {
        d(`Error starting child process: ${error}`);
    });

    child.stdout.on("data", function(data) {
        d(`child.stdout: ${data.toString('utf-8')}`);

        // Speak output from the shell process.
        ATTRS.sendGCSMessage(ATTRS.id, {
            id: "speech",
            text: data.toString('utf-8')
        });
    });

    child.stderr.on("data", function(data) {
        d(`child.stderr: ${data.toString('utf-8')}`);

        // Speak output from the shell process.
        ATTRS.sendGCSMessage(ATTRS.id, {
            id: "speech",
            text: data.toString('utf-8')
        });
    });

    child.on("close", function(code) {
        d(`Child closed with ${code}`);
        mChildProcess = null;
    });

    mChildProcess = child;

    // TODO: Use this to update the button text to show which LED is running.
    // ATTRS.sendGCSMessage(ATTRS.id, {
    //     id: "screen_update",
    //     screen_id: "commands",
    //     panel_id: "worker_flight_buttons",
    //     values: {
    //         btn_stop_shell: { enabled: true },
    //         btn_start_shell: { enabled: false }
    //     }
    // });

    return { ok: true, message: `started ${name}` };
}

function stopShellProcess() {
    d(`stopShellProcess()`);

    if(!mChildProcess) {
        d(`Child process is not running`);
        return { ok: false, message: "Child process is not running" };
    }

    // ATTRS.sendGCSMessage(ATTRS.id, {
    //     id: "screen_update",
    //     screen_id: "commands",
    //     panel_id: "worker_flight_buttons",
    //     values: {
    //         btn_stop_shell: { enabled: false },
    //         btn_start_shell: { enabled: true }
    //     }
    // });

    shellCommand({command: "quit"});

    return { ok: true, message: "stopped" };
}

function sendContentDialogMsg() {
    if(!mMenuItems) {
        return d(`No menu items to display`);
    }

    const items = [];

    if(mMenuItems["default"]) {
        const defItem = mMenuItems["default"];
        items.push({id: "default", text: defItem.name, msg_id: "run_led" });
    }

    for(let prop in mMenuItems) {
        if(prop === "default") continue;

        const item = mMenuItems[prop];
        items.push({id: item.id, text: prop, msg_id: "run_led" });
    }

    // d(`items=${JSON.stringify(items)}`);

    ATTRS.sendGCSMessage(ATTRS.id, {
        id: "content_dialog",
        dialog_id: "dlg_content_download",
        title: "Select LEDs",
        text: "Pick an LED mode.",
        list_items: items
    });
}

function sendModeToLEDs(mode) {
    if(!mChildProcess) {
        return d("No child process");
    }

    mChildProcess.stdin.write(`mode ${mode.toLowerCase()}\n`);
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

function onScreenEnter(screen) {
    switch (screen) {
        case ATTRS.api.WorkerUI.Const.SCREEN_COMMANDS: {
            const body = ATTRS.api.WorkerUI.loadLayout(__dirname, ATTRS.api.WorkerUI.Const.PANEL_WORKER_FLIGHT_BUTTONS);

            if (body) {
                if (body) {
                    const running = (mChildProcess != null);

                    const startbutton = ATTRS.api.WorkerUI.findViewById(body, "btn_start_shell");
                    if(startbutton) startbutton.enabled = !running;

                    const stopbutton = ATTRS.api.WorkerUI.findViewById(body, "btn_stop_shell");
                    if(stopbutton) stopbutton.enabled = running;

                    d(JSON.stringify(body));

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
exports.onScreenEnter = onScreenEnter;

if(process.mainModule === module) {
    onLoad();
    sendContentDialogMsg();
}

