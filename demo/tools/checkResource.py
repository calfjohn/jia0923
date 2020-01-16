# encoding:utf-8
# 功能：检查PROJECT_DIR目录下所有*.prefab，检查资源是否失效，是否跨目录使用资源
# 版本：CocosCreator2.0.10
#修改 OUT_FILE_NAME 导出指定文件文件名
# DEST_DIR 导出目录

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

DEST_DIR = '../assets/common/global/'

OUT_FILE_NAME = ['zh','en',"cn"]

DICT_UUID2PREFAB = {}   #保存预制体UUID下载加载状态的字典

_allUuidToName = {}      #临时字典，方便计算
_allPathToUuid = {}

_typeName = u"__type__"
_uuidName = u"__uuid__"
_refPath = []

def lichLog(param):
    if SHOWLOG:
        print (unicode(str(param), encoding="utf-8"))

def buildUuid2Path(dirPath):
    if dirPath[-1] == '/':
        print u'文件夹路径末尾不能加/'
        return
    allFilesUuid = []
    if os.path.isdir(dirPath):
        fileList = os.listdir(dirPath)
        for f in fileList:
            f = dirPath+'/'+f
            if os.path.isdir(f):
                subFiles = buildUuid2Path(f)
                allFilesUuid = subFiles + allFilesUuid               #合并当前目录与子目录的所有文件路径
            else:
                tempL = f.split('.')
                extName = tempL[len(tempL) - 1]
                if extName in ['prefab', 'fire', 'anim', 'jpg', 'png', 'jpeg']:
                    name = basename(f)
                    with open(f + '.meta') as temp:
                        jsonData = json.load(temp)

                        uuid = jsonData['uuid']
                        if extName in ['jpg', 'png', 'jpeg']:
                            uuid = jsonData['subMetas'][name.split('.')[0]]['uuid']
                        if _allUuidToName.get(uuid) is None:
                            _allUuidToName[uuid] = {'path': f, 'name': name}
                            _allPathToUuid[f] = uuid
                            if extName in ['prefab', 'fire', 'anim']:
                                allFilesUuid.append(uuid)
                        else:
                            #出现重复的uuid，极少
                            lichLog(_allUuidToName[uuid]['name'] + " " + _allUuidToName[uuid]['path'])
                            lichLog(name + " " + f)

        return allFilesUuid
    else:
        return 'Error,not a dir'

def checkArrayExist(array, key):
    for value in array:
        if value == key:
            return True
    return False

def readTreeStruct(key, data, isRoot):
    if isinstance(data, dict):
        temp = data.get(_uuidName)
        if temp is not None and temp != key:
            flag1 = _allUuidToName.get(temp)
            path = _allUuidToName[key]['path']
            if flag1 is None:
                # lichLog('The rescource is missing: ' + temp + ' \n In ' + path)
                return

            flag2 = DICT_UUID2PREFAB.get(temp)
            if flag2 is None:
                DICT_UUID2PREFAB[temp] = json.loads('{"path":0, "refs":[]}')
                DICT_UUID2PREFAB[temp]['path'] = _allUuidToName[temp]['path']

            if not checkArrayExist(DICT_UUID2PREFAB[temp]['refs'], path):
                DICT_UUID2PREFAB[temp]['refs'].append(path)
        else:
            for item in data:
                readTreeStruct(key, data[item], False)
    elif isinstance(data, list):
        for item in data:
            readTreeStruct(key, item, False)

def isRefrenceInScene(key):
    temp = DICT_UUID2PREFAB.get(key)
    if temp is None:
        return False

    _refPath.append(temp['path'])
    #被resources下的prefab引用，或者被fire引用，都可以
    for p in DICT_UUID2PREFAB[key]['refs']:
        if p.startswith('../assets/resources'):
            return True
        elif p.endswith('.fire'):
            return True
        elif isRefrenceInScene(_allPathToUuid[p]):
            return True

    return False

if __name__ == '__main__':
    lichLog('开始处理文件')

    fileList = buildUuid2Path(PROJECT_DIR)
    for uuid in fileList:
        temp = _allUuidToName.get(uuid)
        with open(temp['path']) as filePath:
            jsonData = json.load(filePath)
            readTreeStruct(uuid, jsonData, True)
            lichLog("已处理文件:" + temp['name'])

    lichLog('\n跨文件夹使用资源的清单：')
    #比较文件夹前三级是否一致
    for item in DICT_UUID2PREFAB:
        temp = DICT_UUID2PREFAB[item]['path'].split('/')
        path = temp[0] + '/' + temp[1] + '/' + temp[2] + '/' + temp[3]
        for p in DICT_UUID2PREFAB[item]['refs']:
            if not p.startswith(path) and not p.startswith('../assets/resources'):
                lichLog(DICT_UUID2PREFAB[item]['path'] + ' ==> ' + p)

    lichLog('\n没有被场景引用的资源：')
    #TODO 需要进一步查验，是否被场景使用
    for item in DICT_UUID2PREFAB:
        _refPath = []
        if not isRefrenceInScene(item):
            _refPath.append('null')
            lichLog(" ==> ".join(_refPath))

    lichLog('处理完毕！')
