import sys

print "Python script starting up"
sys.stdout.flush()

while 1:
	try:
		line = sys.stdin.readline()
	except KeyboardInterrupt:
		break

	if not line:
		break

	line = line.rstrip()

	if line == 'quit':
		break
	elif line == "speak":
		print "Hello from python"
	else:
		print "line is " + line

	sys.stdout.flush()

print "Python script done"
sys.stdout.flush()
