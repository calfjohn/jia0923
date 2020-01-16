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

PROJECT_DIR = '../assets'

DEST_DIR = './'

OUT_FILE_NAME = ['zh']

DICT = {}
DICT_LABEL = {}

def lichLog(param):
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
    keyName = "cc.Label"
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
        DICT[fileName][path] = obj;

    if(obj[typeName] == richComp):
        fileDict = DICT.get(fileName);
        if (fileDict == None):
            DICT[fileName] = {}
        DICT[fileName][path] = obj;

    components = obj.get(componentName);
    if (components != None):
        for value in components:
            readTreeStruct(jsonData, path, value[idName],fileName);

    childs = obj.get(childName);
    if (childs != None):
        for value in childs:
            readTreeStruct(jsonData, path, value[idName],fileName);

def readFileLabel (filePath):
    fileName = basename(filePath).split('.', 1 )[0];
    with open(filePath) as f:
        jsonData = json.load(f)
        readTreeStruct(jsonData,None,None,fileName)

    with open(filePath) as f:
        jsonData = json.load(f)
        readTreeStructOut(jsonData,None,None,fileName)

def readTreeStructOut(jsonData,path,index,fileName):
    typeName = "__type__"
    nodeName = "cc.Node"
    nameName = "_name"
    idName = "__id__"
    keyName = "cc.LabelOutline"
    valueName = "_N$string"
    childName = "_children"
    componentName = "_components"
    if (index == None):
        readTreeStructOut(jsonData, path, 1,fileName);
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
            pass
        elif DICT[fileName][path] != None:
            if (DICT[fileName][path]["_N$file"] != None):
                setLabeLOut(fileName,path);
        else:
            pass


    components = obj.get(componentName);
    if (components != None):
        for value in components:
            readTreeStructOut(jsonData, path, value[idName],fileName);

    childs = obj.get(childName);
    if (childs != None):
        for value in childs:
            readTreeStructOut(jsonData, path, value[idName],fileName);

def setLabeLOut(fileName,path):
    fileDict = DICT_LABEL.get(fileName)
    if (fileDict == None):
        DICT_LABEL[fileName] = {}
    DICT_LABEL[fileName][path] = "---";

def reWriteFile(fileName):
    destFilePath = DEST_DIR + "/static_"+fileName+".js"
    fo = open(destFilePath, "w+")
    fo.write( "window.langCache = window.langCache || {};\nwindow.langCache[\""+fileName+"\"] = ");
    fo.close()
    data = json.dumps(DICT_LABEL,ensure_ascii=False,indent=4)
    with open(destFilePath,"a+") as f:
        f.write(data);
        f.close()

if __name__ == '__main__':
    lichLog('开始处理文件')
    fileList=readDir(PROJECT_DIR)
    for f in fileList:
        if f.endswith('.fire.meta') or f.endswith('.prefab.meta'):
            pass
        elif f.endswith('.fire') or f.endswith('.prefab'):
            readFileLabel(f)
            msg = "已处理文件:" + basename(f)
            lichLog((msg))
        else:
            pass

    for k, v in enumerate(OUT_FILE_NAME):
        reWriteFile(v)

    lichLog('处理完毕！')
