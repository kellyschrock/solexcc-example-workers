# LEDs

This is a worker that controls a string of LEDs. 

First, get a set of these LEDs:

https://www.amazon.com/gp/product/B06XNJSKXN/ref=ppx_yo_dt_b_asin_title_o05_s00?ie=UTF8&psc=1

Then follow the instructions here to set up a Pi to use them:

https://tutorials-raspberrypi.com/connect-control-raspberry-pi-ws2812-rgb-led-strips/

Then zip up this worker, and install it. 

Edit `default.py` and `led_control.py` to add new flash patterns, colors, etc. 

## Shell Process

This is a decent example of using a shelled sub-process to do some work, and report its output to the GCS. All of the control of the actual LEDs is performed by Python scripts, which take commands on `stdin` and report status on `stdout`. 

## RC monitoring

This worker also monitors the movement of various controls on a transmitter so you can map knobs and switches on a transmitter to LED colors and flash patterns via this worker.

## Vehicle monitoring

This worker also monitors vehicle mode and arm state so it can update the state of the LEDs onboard the vehicle and show which mode it's in.

## Worker UI

This worker shows a simple example of drawing buttons on a toolbar in an app like Solex, and updating their state.







