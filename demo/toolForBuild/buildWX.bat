@echo off
set /p version=version 
set cocosPath="E:\tool-realy\CocosCreator2.0.10\CocosCreator.exe"

if "%version%" == "" (
    echo error
    pause
    exit
)
echo Input Version %version%
echo "##修改setting版本号"
python replaceFIleContent.py  "../settings/builder.json" "https://resource.alienidea.com/minigame/poetry_wx/%VERSION%"

call %cocosPath% --path ..\ --build "platform=wechatgame;debug=false"
python compressRes.py

.\ossutil64\ossutil64.exe mkdir oss://aliens-resource/minigame/poetry_wx/%VERSION%/res

echo "##上传res目录"
.\ossutil64\ossutil64.exe cp -r ../build/wechatgame\res oss://aliens-resource/minigame/poetry_wx/%VERSION%/res

rd /q /s ..\build\wechatgame\res


echo "修复微信小游戏 iphone 锁屏后解锁卡死的问题"
python fixWXBug.py

pause