import sys

from lib.led_control import LEDControl

leds = LEDControl()

def toColor(str):
	if str == "red": 
		return [0, 125, 0]
	elif str == "green":
		return [125, 0, 0]
	elif str == "blue":
		return [0, 0, 125]
	elif str == "purple":
		return [0, 125, 125]
	elif str == "yellow":
		return [125, 125, 0]
	elif str == "orange":
		return [40, 125, 0]
	elif str == "white":
		return [255, 255, 255]
	elif str == "gray":
		return [20, 20, 20]
	else:
		return [0, 0, 0] # only works with black LEDs

while True:
	try:
		line = sys.stdin.readline()
	except KeyboardInterrupt:
		break

	if not line:
		break

	line = line.rstrip()

	# Handle basic commands here.
	# ALWAYS handle quit
	if line == 'quit':
		leds.quit()
		break
	elif line.startswith("mode "):
		leds.on_mode(line[5:])
	elif line.startswith("blink "):
		leds.blink(toColor(line[6:]))
	elif line.startswith("color "):
		leds.color(toColor(line[6:]))
	elif line == "all_off":
		leds.all_off()
	elif line == "arm":
		leds.on_arm()
	elif line == "disarm":
		leds.on_disarm()
	elif line == "cop_mode":
		leds.cop_mode()
	elif line == "party_mode":
		print("speak: Get down party people")
		leds.party_mode()
	elif line == "cylon_mode":
		leds.cylon_mode()
	elif line == "car_mode":
		leds.car_mode()
	elif line == "plane_mode":
		leds.plane_mode()
	elif line == "fade":
		leds.fade([255, 0, 0], [0, 255, 0])
	elif line == "breathe":
		leds.breathe([10, 10, 10], [128, 128, 128])
	else:
		# print "line is " + line
		pass

	sys.stdout.flush()

sys.stdout.flush()

