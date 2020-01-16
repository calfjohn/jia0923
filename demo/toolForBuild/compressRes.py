#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, sys, platform

startdir="../build/wechatgame"

excludePath = [
	'res/raw-assets/mainScene/res/spine',
    'res/raw-assets/mainScene/res/effect/openingAnimation',
    'res/raw-assets/mainScene/res/particle',
    'res/raw-assets/mainScene/res/uncompress'
]

app = ""

def init():
	global startdir
	startdir = startdir.replace('/', os.path.sep)
	for i in range(len(excludePath)):
		excludePath[i] = excludePath[i].replace('/', os.path.sep)

	global app
	strSys = platform.system()
	if strSys == "Windows":
		app = os.path.join("pngquant_windows", "pngquant.exe")
	elif strSys == "Darwin":
		app = os.path.join("pngquant_macos", "pngquant")

def isExcludePath(dirPath):
	for path in excludePath:
		if os.path.normpath(dirPath).find(os.path.normpath(path)) != -1:
			return True
	return False

def isPng(filename):
	return os.path.splitext(filename)[1].lower() == '.png'

def compressFile(filename):
	if app == "":
		return
	os.system(app + ' -f --nofs --ext .png --quality 50-80 ' + filename)

if __name__ == '__main__':
	init()
	for item in os.walk(startdir):
		foo = list(item)
		path = foo[0]
		filenames = foo[2]
		if isExcludePath(path) or len(filenames) == 0:
			continue
		for filename in filenames:
			if isPng(filename):
				filepath = os.path.join(path,filename)
				print("compressing " + filepath)
				compressFile(os.path.join(path,filename))
