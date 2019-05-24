#!/usr/bin/env python3
# NeoPixel library strandtest example
# Author: Tony DiCola (tony@tonydicola.com)
# Mucked around with by: Kelly Schrock (you know where to find me)
#
# Direct port of the Arduino NeoPixel library strandtest example.  Showcases
# various animations on a strip of NeoPixels.
# 
# This is the script you mess around with to control the actual LEDs. Expose methods
# for each setting, and call them from other scripts.

import time
from neopixel import *
import argparse

import time
import threading

# LED strip configuration:
LED_COUNT      = 60      # Number of LED pixels.
LED_PIN        = 18      # GPIO pin connected to the pixels (18 uses PWM!).
LED_FREQ_HZ    = 800000  # LED signal frequency in hertz (usually 800khz)
LED_DMA        = 10      # DMA channel to use for generating signal (try 10)
LED_BRIGHTNESS = 255     # Set to 0 for darkest and 255 for brightest
LED_INVERT     = False   # True to invert the signal (when using NPN transistor level shift)
LED_CHANNEL    = 0       # set to '1' for GPIOs 13, 19, 41, 45 or 53

FRONT_LEFT     	= range(0, 15)
FRONT_RIGHT    	= range(16, 30)
REAR           	= range(31, 60)
REAR_LEFT	   	= range(20, 23)
REAR_RIGHT     	= range(25, 28)
REAR_CENTER_TOP = range(50, 54)
REAR_CENTER_BTM = range(36, 40)
REAR_CENTER_SECTION	 = [36, 37, 38, 39, 50, 51, 52, 53]
TAILLIGHTS 			 = [34, 35, 36, 39, 40, 41, 48, 49, 50, 53, 54, 55]
TAILLIGHTS_ALL		 = [34, 35, 36, 37, 38, 39, 40, 41, 48, 49, 50, 51, 52, 53, 54, 55]
CYLONS				 = [48, 49, 50, 51, 52, 53, 54, 55]

_quit = False

class LEDControl():
	def __init__(self):
		self.task = None
		self.strip = Adafruit_NeoPixel(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS, LED_CHANNEL)
		self.strip.begin()
		print(self.strip)

	def blink(self, color):
		global _quit
		self.stopAnyThreads()
		self.task = threading.Thread(target = doBlink, args = (self.strip, Color(color[0], color[1], color[2]),))
		_quit = False
		self.task.start()

	def color(self, color):
		self.stopAnyThreads()
		allOn(self.strip, Color(color[0], color[1], color[2]))

	def fade(self, colorFrom, colorTo):
		global _quit
		self.stopAnyThreads()
		self.task = threading.Thread(target = doFade, args = (self.strip, colorFrom, colorTo,))
		_quit = False
		self.task.start()

	def breathe(self, colorFrom, colorTo):
		global _quit
		self.stopAnyThreads()
		self.task = threading.Thread(target = doBreathe, args = (self.strip, colorFrom, colorTo,))
		_quit = False
		self.task.start()

	def on_mode(self, mode):
		global _quit
		self.stopAnyThreads()

		self.task = threading.Thread(target = doOnMode, args = (self.strip, mode,))
		_quit = False
		self.task.start()

	def party_mode(self):
		global _quit
		self.stopAnyThreads()
		self.task = threading.Thread(target = doPartyMode, args=(self.strip,))
		_quit = False
		self.task.start()

	def cop_mode(self):
		global _quit
		self.stopAnyThreads()
		self.task = threading.Thread(target = doCopMode, args=(self.strip,))
		_quit = False
		self.task.start()

	def cylon_mode(self):
		global _quit
		self.stopAnyThreads()
		self.task = threading.Thread(target = doCylonMode, args=(self.strip,))
		_quit = False
		self.task.start()

	def car_mode(self):
		global _quit
		self.stopAnyThreads()
		carLights(self.strip)

	def plane_mode(self):
		global _quit
		self.stopAnyThreads()
		self.task = threading.Thread(target = planeLights, args=(self.strip,))
		_quit = False
		self.task.start()

	def on_arm(self):
		global _quit
		self.stopAnyThreads()
		self.task = threading.Thread(target = doBreathe, args=(self.strip, [40, 0, 0], [160, 0, 0], 7,))
		_quit = False
		self.task.start()

	def on_disarm(self):
		global _quit
		self.stopAnyThreads()
		self.task = threading.Thread(target = doBreathe, args=(self.strip, [3, 0, 0], [60, 0, 0], 1))
		_quit = False
		self.task.start()

	def all_off(self):
		self.stopAnyThreads()
		allOn(self.strip, Color(0, 0, 0))

	def slow_breathe(self, color1, color2):
		global _quit
		self.stopAnyThreads()
		self.task = threading.Thread(target = doBreathe, args=(self.strip, color1, color2, 1))
		_quit = False
		self.task.start()

	def fast_breathe(self, color1, color2):
		global _quit
		self.stopAnyThreads()
		self.task = threading.Thread(target = doBreathe, args=(self.strip, color1, color2, 7,))
		_quit = False
		self.task.start()

	def quit(self):
		global _quit
		_quit = True
		self.stopAnyThreads()

		if not self.task is None:
			self.task.join()
			self.task = None

		allOff(self.strip)

	def stopAnyThreads(self):
		global _quit

		if not self.task is None:
			_quit = True
			self.task.join()
			self.task = None

# Private functions
def doPartyMode(strip):
	rainbow(strip)

def fastFlash(range, strip, color, delay):
	for i in range:
		strip.setPixelColor(i, color)

	strip.show()
	time.sleep(delay)

	for i in range:
		strip.setPixelColor(i, Color(0, 0, 0))

	strip.show()
	time.sleep(delay)

def doCopMode(strip):
	white = Color(255, 255, 255)
	off = Color(0, 0, 0)
	blue = Color(0, 0, 255)
	red = Color(0, 255, 0)

	shortDelay = 30/1000.0
	longDelay = 100/1000.0

	while True:

		fastFlash(REAR, strip, red, shortDelay)
		fastFlash(FRONT_LEFT, strip, white, shortDelay)
		fastFlash(REAR, strip, white, shortDelay)
		fastFlash(FRONT_RIGHT, strip, blue, shortDelay)

		fastFlash(REAR, strip, white, shortDelay)
		fastFlash(FRONT_LEFT, strip, blue, shortDelay)
		fastFlash(REAR, strip, red, shortDelay)
		fastFlash(FRONT_RIGHT, strip, white, shortDelay)

		fastFlash(REAR, strip, blue, shortDelay)
		fastFlash(FRONT_LEFT, strip, red, shortDelay)
		fastFlash(REAR, strip, blue, shortDelay)
		fastFlash(FRONT_RIGHT, strip, red, shortDelay)

		if _quit:
			break

def doBlink(strip, color, wait_ms=300):
	while True:
		allOn(strip, color)
		time.sleep(wait_ms / 1000.0)
		allOn(strip, Color(0, 0, 0))
		time.sleep(wait_ms / 1000.0)

		if _quit:
			break

def doOnMode(strip, mode):
	global _quit

	while True:
		if mode == "stabilize":
			planeLights(strip, Color(0, 255, 0))
		elif mode == "land":
			landingLights(strip)
		elif mode == "acro":
			allOn(strip, Color(0, 255, 20))
		elif mode == "auto":
			doBreathe(strip, [125, 0, 0], [0, 125, 0], 1)
			# planeLights(strip, Color(0, 255, 255))
		elif mode == "circle":
			rainbowCycle(strip, 40, 10000) 
		elif mode == "rtl":
			doBlink(strip, Color(0, 255, 0))
		elif mode == "rtl":
			doBlink(strip, Color(0, 125, 125), 600)
		elif mode == "pos_hold":
			planeLights(strip, Color(0, 0, 255))
		elif mode == "alt_hold":
			planeLights(strip, Color(60, 255, 0))
		elif mode == "loiter":
			planeLights(strip, Color(255, 0, 0))
		elif mode == "brake":
			brakeLights(strip)
		elif mode == "drift":
			allOn(strip, Color(35, 90, 255))
		elif mode == "throw":
			doBlink(strip, Color(255, 0, 0), 500)
		elif mode == "avoid_adsb":
			doBlink(strip, Color(0, 255, 0), 200)
		elif mode == "guided":
			carLights(strip)
		elif mode == "guided_nogps":
			carLights(strip)
		elif mode == "training":
			allOn(strip, Color(35, 90, 255))
		elif mode == "fbwa":
			planeLights(strip, Color(255, 255, 255))
		elif mode == "fbwb":
			planeLights(strip, Color(0, 255, 255))
		elif mode == "cruise":
			planeLights(strip, Color(255, 255, 255))
		elif mode == "autotune":
			doBlink(strip, Color(100, 0, 255), 500)
		elif mode == "manual":
			allOn(strip, Color(125, 45, 0))
		elif mode == "learning":
			allOn(strip, Color(125, 125, 125))
		elif mode == "steering":
			allOn(strip, Color(36, 24, 36))
		elif mode == "hold":
			allOn(strip, Color(50, 200, 0))
		elif mode == "initializing":
			doBlink(strip, Color(255, 0, 0), 1000)

		time.sleep(0.5)
		if _quit:
			break

def doCylonMode(strip):
	for i in REAR:
		strip.setPixelColor(i, Color(0, 0, 0))
	
	strip.show()

	frontColor = Color(30, 30, 30)
	delay = 80

	for i in FRONT_LEFT:
		strip.setPixelColor(i, frontColor)

	for i in FRONT_RIGHT:
		strip.setPixelColor(i, frontColor)

	strip.show()

	while True:
		for i in CYLONS:
			strip.setPixelColor(i, Color(0, 255, 0))
			strip.setPixelColor(i-1, Color(0, 0, 0))
			strip.show()
			time.sleep(delay/1000.0)
			if _quit:
				break
			
		for i in reversed(CYLONS):
			strip.setPixelColor(i, Color(0, 255, 0))
			strip.setPixelColor(i+1, Color(0, 0, 0))
			strip.show()
			time.sleep(delay/1000.0)
			if _quit:
				break

		time.sleep(20/1000.0)
		if _quit:
			break


# Define functions which animate LEDs in various ways.
def colorWipe(strip, color, wait_ms=50):
	global _quit

	"""Wipe color across display a pixel at a time."""
	for i in range(strip.numPixels()):
		strip.setPixelColor(i, color)
		strip.show()
		time.sleep(wait_ms/1000.0)
		if _quit:
			break

def allOn(strip, color):
    global _quit

    for i in range(strip.numPixels()):
        strip.setPixelColor(i, color)

    strip.show()

def color(strip, color):
    global _quit

    for i in range(strip.numPixels()):
        strip.setPixelColor(i, color)
        if _quit:
            break

    strip.show()

def allOff(strip):
	allOn(strip, Color(0, 0, 0))

def planeLights(strip, backColor=Color(255, 255, 255)):
	for i in FRONT_RIGHT:
		strip.setPixelColor(i, Color(128, 0, 0))

	for i in FRONT_LEFT:
		strip.setPixelColor(i, Color(0, 128, 0))

	for i in REAR:
		strip.setPixelColor(i, Color(0, 0, 0))

	while True:
		fastFlash(REAR_CENTER_SECTION, strip, backColor, 20/1000.0)
		time.sleep(40/1000.0)
		fastFlash(REAR_CENTER_TOP, strip, backColor, 20/1000.0)
		fastFlash(REAR_CENTER_BTM, strip, backColor, 20/1000.0)

		if _quit:
			break
			
		time.sleep(1)

		if _quit:
			break

		time.sleep(1)

		if _quit:
			break

def landingLights(strip, backColor=Color(10, 255, 0)):
	for i in FRONT_RIGHT:
		strip.setPixelColor(i, Color(255, 255, 255))

	for i in FRONT_LEFT:
		strip.setPixelColor(i, Color(255, 255, 255))

	for i in REAR:
		strip.setPixelColor(i, Color(0, 0, 0))

	while True:
		fastFlash(REAR_CENTER_SECTION, strip, backColor, 20/1000.0)

		if _quit:
			break
			
		time.sleep(300/1000.0)

		if _quit:
			break

def carLights(strip):
    for i in FRONT_LEFT:
        strip.setPixelColor(i, Color(255, 255, 255))

    for i in FRONT_RIGHT:
        strip.setPixelColor(i, Color(255, 255, 255))

    for i in REAR:
        strip.setPixelColor(i, Color(0, 0, 0))

	for i in TAILLIGHTS:
		strip.setPixelColor(i, Color(0, 100, 0))

    strip.show()

def brakeLights(strip):
    for i in FRONT_LEFT:
        strip.setPixelColor(i, Color(255, 255, 100))

    for i in FRONT_RIGHT:
        strip.setPixelColor(i, Color(255, 255, 100))

    for i in REAR:
        strip.setPixelColor(i, Color(0, 0, 0))

	for i in TAILLIGHTS_ALL:
		strip.setPixelColor(i, Color(0, 255, 0))

    strip.show()

def theaterChase(strip, color, wait_ms=50, iterations=10):
    global _quit

    """Movie theater light style chaser animation."""
    for j in range(iterations):
        for q in range(3):
            if _quit:
                break

            for i in range(0, strip.numPixels(), 3):
                strip.setPixelColor(i+q, color)
                if _quit:
                    break

            strip.show()
            time.sleep(wait_ms/1000.0)
            for i in range(0, strip.numPixels(), 3):
                if _quit:
                    break
                strip.setPixelColor(i+q, 0)

def wheel(pos):
    """Generate rainbow colors across 0-255 positions."""
    if pos < 85:
        return Color(pos * 3, 255 - pos * 3, 0)
    elif pos < 170:
        pos -= 85
        return Color(255 - pos * 3, 0, pos * 3)
    else:
        pos -= 170
        return Color(0, pos * 3, 255 - pos * 3)

def rainbow(strip, wait_ms=20, iterations=10000):
    global _quit

    """Draw rainbow that fades across all pixels at once."""
    for j in range(256*iterations):
        for i in range(strip.numPixels()):
            strip.setPixelColor(i, wheel((i+j) & 255))
        strip.show()
        time.sleep(wait_ms/1000.0)
        if _quit:
            break

def doBreathe(strip, colorStart, colorEnd, step=5):
	global _quit

	while True:
		doFade(strip, colorStart, colorEnd, step)
		if _quit:
			break

		doFade(strip, colorEnd, colorStart, step)
		if _quit:
			break

def doFade(strip, colorLo, colorHi, step=1, wait_ms=20):
	global _quit

	gLo = colorLo[0]
	rLo = colorLo[1]
	bLo = colorLo[2]

	gHi = colorHi[0]
	rHi = colorHi[1]
	bHi = colorHi[2]

	gStep = -step if (colorLo[0] > colorHi[0]) else step
	gList = list(range(colorLo[0], colorHi[0], gStep))

	rStep = -step if (colorLo[1] > colorHi[1]) else step
	rList = list(range(colorLo[1], colorHi[1], rStep))

	bStep = -step if (colorLo[2] > colorHi[2]) else step
	bList = list(range(colorLo[2], colorHi[2], rStep))

	g = gList[0] if len(gList) > 0 else 0
	r = rList[0] if len(rList) > 0 else 0
	b = bList[0] if len(bList) > 0 else 0

	gIndex = 0
	rIndex = 0
	bIndex = 0

	done = False

	while not done:
		done = gIndex >= len(gList) and rIndex >= len(rList) and bIndex >= len(bList)
		if done:
			break

		if gIndex < len(gList):
			g = gList[gIndex]
			gIndex += 1

		if rIndex < len(rList):
			r = rList[rIndex]
			rIndex += 1

		if bIndex < len(bList):
			b = bList[bIndex]
			bIndex += 1

		for i in range(strip.numPixels()):
			strip.setPixelColor(i, Color(g, r, b))
		
		strip.show()

		if _quit:
			break

		time.sleep(wait_ms / 1000.0)

def rainbowCycle(strip, wait_ms=20, iterations=5):
    global _quit

    """Draw rainbow that uniformly distributes itself across all pixels."""
    for j in range(256*iterations):
        for i in range(strip.numPixels()):
            strip.setPixelColor(i, wheel((int(i * 256 / strip.numPixels()) + j) & 255))
        strip.show()
        time.sleep(wait_ms/1000.0)
        if _quit: 
            break

def theaterChaseRainbow(strip, wait_ms=50):
    global _quit

    """Rainbow movie theater light style chaser animation."""
    for j in range(256):
        for q in range(3):
            for i in range(0, strip.numPixels(), 3):
                strip.setPixelColor(i+q, wheel((i+j) % 255))
            strip.show()
            time.sleep(wait_ms/1000.0)
            if _quit:
                break

            for i in range(0, strip.numPixels(), 3):
                strip.setPixelColor(i+q, 0)

# # Main program logic follows:
# if __name__ == '__main__':
#     # Process arguments
#     parser = argparse.ArgumentParser()
#     parser.add_argument('-c', '--clear', action='store_true', help='clear the display on exit')
#     args = parser.parse_args()

#     # Create NeoPixel object with appropriate configuration.
#     strip = Adafruit_NeoPixel(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS, LED_CHANNEL)
#     # Intialize the library (must be called once before other functions).
#     strip.begin()

#     print ('Press Ctrl-C to quit.')
#     if not args.clear:
#         print('Use "-c" argument to clear LEDs on exit')

#     try:

#         while True:
#             print ('Color wipe animations.')
#             colorWipe(strip, Color(255, 0, 0))  # Red wipe
#             colorWipe(strip, Color(0, 255, 0))  # Blue wipe
#             colorWipe(strip, Color(0, 0, 255))  # Green wipe
#             print ('Theater chase animations.')
#             theaterChase(strip, Color(127, 127, 127))  # White theater chase
#             theaterChase(strip, Color(127,   0,   0))  # Red theater chase
#             theaterChase(strip, Color(  0,   0, 127))  # Blue theater chase
#             print ('Rainbow animations.')
#             rainbow(strip)
#             rainbowCycle(strip)
#             theaterChaseRainbow(strip)

#     except KeyboardInterrupt:
#         if args.clear:
#             colorWipe(strip, Color(0,0,0), 10)
