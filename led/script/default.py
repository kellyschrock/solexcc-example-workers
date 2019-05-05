import sys

from lib.led_control import LEDControl

leds = LEDControl()

while 1:
	try:
		line = sys.stdin.readline()
	except KeyboardInterrupt:
		break

	if not line:
		break

	line = line.rstrip()

	# Handle basic commands here.
	if line == 'quit':
		leds.quit()
		break
	elif line.startswith("mode "):
		leds.on_mode(line[5:])
	elif line == "blink":
		leds.blink()
	elif line == "landing_lights":
		leds.landing_lights()
	elif line == "arm":
		leds.on_arm()
	elif line == "disarm":
		leds.on_disarm()
	else:
		# print "line is " + line
		pass

	sys.stdout.flush()

print "Python script done"
sys.stdout.flush()

