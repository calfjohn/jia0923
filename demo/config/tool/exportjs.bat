set WORKFILENAME=%1
java.exe -jar KylinTools.jar -d javascript -i %~dp0\..\%WORKFILENAME% -o %~dp0\..\..\assets\common\scripts\lib\jsonTablesSub.js -t %~dp0\js.template
