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

	# Handle basic commands here.
	if line == 'quit':
		break
	elif line == "say_hello":
		print "Hello from python"
	elif line == "say_something_else":
		print "Subprocesses are cool"
	else:
		print "line is " + line

	sys.stdout.flush()

print "Python script done"
sys.stdout.flush()
