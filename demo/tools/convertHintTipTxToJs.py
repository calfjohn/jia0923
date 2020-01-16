# encoding:utf-8
# 功能：提取PROJECT_DIR目录下所有*.prefab 和 *.fire文件
#修改 OUT_FILE_NAME 导出指定文件文件名
# DEST_DIR 导出目录

# created by lich on 2017/11/11
import os
from os.path import basename
import json
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

SHOWLOG = False
if len(sys.argv) == 1:
    SHOWLOG = True

PROJECT_DIR = '../assets'

DEST_DIR = '../assets/common/scripts/word/static/'

OUT_FILE_NAME = ['zh','en']

DEFAULT_STR = '策划还没配'

addStr = "window.hintCache = window.hintCache || {};\nwindow.hintCache[\"zh\"] = "

lastHintTip =  {}

DICT = {}

def lichLog(param):
    if SHOWLOG:
        print (unicode(str(param), encoding="utf-8"))

def readDir(dirPath):
    if dirPath[-1] == '/':
        print u'文件夹路径末尾不能加/'
        return
    allFiles = []
    if os.path.isdir(dirPath):
        fileList = os.listdir(dirPath)
        for f in fileList:
            f = dirPath+'/'+f
            if os.path.isdir(f):
                subFiles = readDir(f)
                allFiles = subFiles + allFiles #合并当前目录与子目录的所有文件路径
            else:
                allFiles.append(f)
        return allFiles
    else:
        return 'Error,not a dir'

def readTreeStruct(jsonData,path,index,fileName):
    typeName = "__type__"
    nodeName = "cc.Node"
    nameName = "_name"
    idName = "__id__"
    richComp = "cc.RichText"
    keyName = "17a89HjtVNHj7qVhOv3lKAs"
    valueName = "_N$string"
    childName = "_children"
    componentName = "_components"
    if (index == None):
        readTreeStruct(jsonData, path, 1,fileName);
        return;
    obj = jsonData[index];
    if(obj == None):
        return
    if(obj[typeName] == nodeName):
        if path == None:
            path = obj[nameName];
        else:
            path = path + "/" + obj[nameName];

    if(obj[typeName] == keyName):
        fileDict = DICT.get(fileName);
        if (fileDict == None):
            DICT[fileName] = {}
        if(lastHintTip.get(fileName) == None):
            DICT[fileName][path] = path;
        else:
            if(lastHintTip[fileName].get(path) == None):
                DICT[fileName][path] = path;
            else:
                DICT[fileName][path] = lastHintTip[fileName][path];

    components = obj.get(componentName);
    if (components != None):
        for value in components:
            readTreeStruct(jsonData, path, value[idName],fileName);

    childs = obj.get(childName);
    if (childs != None):
        for value in childs:
            readTreeStruct(jsonData, path, value[idName],fileName);


def readFile1 (fileName):
    filePath = DEST_DIR + "hintTip_"+fileName+".js"
    with open(filePath) as f:
        fstr = f.read()
        addLen = len(addStr)
        f1 = fstr[addLen:]
        jsonData = json.loads(f1)
        return jsonData

def readFile (filePath):
    fileName = basename(filePath).split('.', 1 )[0];
    with open(filePath) as f:
        jsonData = json.load(f)
        readTreeStruct(jsonData,None,None,fileName)

def reWriteFile(fileName):
    destFilePath = DEST_DIR + "/hintTip_"+fileName+".js"
    fo = open(destFilePath, "w+")
    fo.write( "window.hintCache = window.hintCache || {};\nwindow.hintCache[\""+fileName+"\"] = ");
    fo.close()
    data = json.dumps(DICT,ensure_ascii=False,indent=4)
    with open(destFilePath,"a+") as f:
        f.write(data);
        f.close()

if __name__ == '__main__':
    lichLog('开始处理文件')
    fileList=readDir(PROJECT_DIR)
    for k, v in enumerate(OUT_FILE_NAME):
        lastHintTip = readFile1(v)
        for f in fileList:
            if f.endswith('.fire.meta') or f.endswith('.prefab.meta'):
                pass
            elif f.endswith('.fire') or f.endswith('.prefab'):
                readFile(f)
                msg = "已处理文件:" + basename(f)
                lichLog((msg))
            else:
                pass
        reWriteFile(v)

    lichLog('处理完毕！')
