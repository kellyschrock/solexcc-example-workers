import sys

"""Blinks the LEDS"""

sys.stdout.flush()

while 1:
	try:
		line = sys.stdin.readline()
	except KeyboardInterrupt:
		break

	if not line:
		break

	line = line.rstrip()

	# ALWAYS include this handler.
	if line == 'quit':
		break
	elif line == "red":
		print "Blink red"
	elif line == "blue":
		print "Blink blue"
	elif line == "yellow":
		print "Blink yellow"
	else:
		print "line is " + line

	sys.stdout.flush()

print "Blink done"
sys.stdout.flush()
