# Shell

There are several reasons you might want to implement a worker's logic in something other than Node. Reasons like "I don't like Node" or "I have a bunch of Python that I don't want to rewrite" are all valid. So here's a basic example of using a worker as a shell for a Python script that takes input on `stdin` and emits output on (unsurprisingly) `stdout`. 

The worker takes a `start` command that starts the script, but you could just as easily do it from `onLoad()` when your worker starts up. The `stop` command stops the script. In between, you can send a `speak` command to it and the output from the Python script will be spoken.

Anything you build can work like this, whether it's a C program, Python, or a shell script. All you need to do is read input from `stdin` and write to `stdout`.

Since the communication between the worker and the child process is asynchronous, this is something you'll most likely want to do anyway (even with child Node processes) if you're involved in something involving a lot of computation.
