@echo off
set /p version=version 
echo Input Version %version%

ren ..\build\web-mobile ZCode

7z.exe a ..\..\buildVeision\%version%.zip ..\build\ZCode

echo "##删除oss目录"
.\ossutil64\ossutil64.exe rm oss://aliens-resource/public/ZCode -r -f
echo "##创建oss新版本目录"
.\ossutil64\ossutil64.exe mkdir oss://aliens-resource/public/ZCode
echo "##上传ZCodeDev目录"
.\ossutil64\ossutil64.exe cp -r ..\build\ZCode oss://aliens-resource/public/ZCode

rd /q /s ..\build\ZCode

pause