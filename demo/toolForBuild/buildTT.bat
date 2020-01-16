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
python replaceFIleContent.py  "../settings/builder.json" "https://resource.alienidea.com/minigame/poetry_tt/%VERSION%"

call %cocosPath% --path ..\ --build "platform=wechatgame;debug=false"
python compressRes.py

.\ossutil64\ossutil64.exe mkdir oss://aliens-resource/minigame/poetry_tt/%VERSION%/res

echo "##上传res目录"
.\ossutil64\ossutil64.exe cp -r ../build/wechatgame\res oss://aliens-resource/minigame/poetry_tt/%VERSION%/res

rd /q /s ..\build\wechatgame\res

pause