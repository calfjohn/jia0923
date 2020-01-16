# encoding:utf-8
# 功能：修改指定文件的指定内容

# created by lich on 2018/09/20
import sys
import json
reload(sys)
sys.setdefaultencoding('utf-8')


if __name__ == '__main__':
    argvlen = len(sys.argv)
    filePath = '../assets/common/scripts/aalib/aazCodeVersion.js'
    keyWord = 'zCodeVersion.version '
    content = '192.168.1.1'
    childName = "wechatgame"
    componentName = "REMOTE_SERVER_ROOT"
    if (argvlen < 3):
        print ("error param")
        exit()
    else:
        filePath = sys.argv[1]
        content = sys.argv[2]

    data = ''
    print (filePath)
    print (content)
    
    with open(filePath, 'r+') as f:
        load_dict = json.load(f)
        load_dict[childName][componentName] = content;


    with open(filePath,"w") as f:
        json.dump(load_dict,f)     
    exit()
