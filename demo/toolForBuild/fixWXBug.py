# encoding:utf-8
# 功能：修复微信小游戏 iphone 锁屏后解锁卡死的问题		https://forum.cocos.com/t/cocos-iphone/71178

# created by junwei on 2019/06/05
import sys
import json
import os

filePath = '../build/wechatgame'
fileName = 'cocos2d-js-min'
keyWord = ',preserveDrawingBuffer:!0'
fileStr = ''
def lichLog(param):
	print (unicode(str(param), encoding="utf-8"))
#md5加密导致文件名不同，需要通过前缀找到文件名
def getRealyFileName():
	list = os.listdir(filePath)
	for name in list:
		if(name.find(fileName) != -1):
			return name
	return 0



if __name__ == '__main__':
	print ("1111")
	realyName = getRealyFileName()
	realyPath = filePath + "/" + realyName
	lichLog(realyPath)
	with open(realyPath, 'r') as f:
		fileStr = f.read()
	#字符串替换，删除这句代码
	newStr = fileStr.replace(",preserveDrawingBuffer:!0","")
	with open(realyPath, 'w') as f1:
		f1.write(newStr)
	exit()
