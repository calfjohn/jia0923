@echo off

set cocosPath="E:\tool-realy\CocosCreator2.0.10\CocosCreator.exe"

call %cocosPath% --path ..\ --build "platform=web-mobile;debug=false"

python webCompressRes.py

pause