@echo off
set app=%~dp0\pngquant_windows\pngquant.exe
set work_path=..\..\build\web-mobile\
cd %work_path%
echo startCompress...
for /R %%s in (*.png) do (
	echo compress-> %%s
	%app% -f --nofs --ext .png %%s
)

echo 压缩结束...
