# -*- coding: UTF-8 -*- 需要protobuf 5这个版本  6脚本命令改了  巨坑
import os
import shutil
import platform

#生成的js文件名
scriptName='msgType'
#协议包名
packageName='protocol'
#项目下的路径
destDir = '../assets/common/scripts/protocol/'+scriptName+'.js'


if __name__ == '__main__':
    system = platform.system()
    cmd = ''
    param = './*.proto -t js -e '+packageName+' -i populateAccessors -m true -o ./'+scriptName+'.js'
    if (system == "Darwin") :
        cmd = ' ./protobufjsForMac/bin/pbjs ' + param
    else:
        cmd = '.\protobufjsForWin\pbjs  ' + param
    print(cmd)
    os.system(cmd)
    # 打开一个文件
    fo = open('./'+scriptName+'.js', "a+")
    fo.write( "\nmodule.exports="+packageName+";");
    # 关闭打开的文件
    fo.close()
    shutil.move('./'+scriptName+'.js',destDir)
