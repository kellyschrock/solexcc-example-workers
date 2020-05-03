# Shell

There are several reasons you might want to implement a worker's logic in something other than Node. Reasons like "I don't like Node" or "I have a bunch of Python that I don't want to rewrite" are all valid. So here's a basic example of using a worker as a shell for a program written in a different language.

There are a few ways to do this. If you need to run some sort of command periodically and see its output in your worker, you can just use Node's `child_process` framework for launching a sub-process (passing command-line arguments if you like) and capturing the sub-process's output.

In this example, the sub-process is treated more like an integral part of the worker. In the `start` processing for this worker, it starts the sub-process and keeps it in memory. Subsequent commands are sent to the sub-process so they arrive at its `stdin`, so from the perspective of the sub-process, the user is typing input, followed by a press of the Enter key. You could also load your sub-process during the `onLoad()` event of your worker.

A sub-process in this configuration can send output at any time, by printing to `stdout` (followed by a linefeed). The worker in this example, intercepts this output and sends its content as a `speech` message to the GCS, so it can speak whatever was sent by the sub-process using the TTS voice on the client device.

Anything you build can work like this, whether it's a C program, Python, or a shell script. All you need to do is read input from `stdin` and write to `stdout`. The shell worker can send "commands" by emitting output to the sub-process, and respond to "events" by watching for output. 

Since the communication between the worker and the child process is asynchronous, this is something you'll most likely want to do anyway (even with child Node processes) if you're involved in something involving a lot of computation. That way it won't hold up the Node process doing long-running things.

A decent side benefit of this approach is that if you build the core functionality of a worker like this, you can test it independently of Solex CC's worker environment.

The `ui` portion of this worker illustrates putting a couple of simple buttons on Solex's toolbar, and updating them according to internal state.

Elsewhere in these examples, you'll find an `leds` worker that makes more complete use of this general idea.




