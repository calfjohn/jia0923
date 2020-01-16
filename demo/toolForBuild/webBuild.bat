@echo off

set cocosPath="E:\tool-realy\CocosCreator2.0.10\CocosCreator.exe"

set sshProjectDir=/mnt/var/www/public/
set sshProjectName=ZCodeDev
set sshIp=39.108.219.251
set sshRoot=root
set sshPwd=1L2Cj1KPjpNfJw3O


call %cocosPath% --path ..\ --build "platform=web-mobile;debug=false"

python compressRes_web.py

ren ..\build\web-mobile  %sshProjectName%

7z.exe a ..\build\%sshProjectName%.zip ..\build\%sshProjectName%

echo cd %sshProjectDir%> cmd.txt

echo rm -rf %sshProjectName%>> cmd.txt

putty.exe -pw %sshPwd% -ssh %sshRoot%@%sshIp% -m cmd.txt

pscp.exe -C -pw %sshPwd% ..\build\%sshProjectName%.zip %sshRoot%@%sshIp%:%sshProjectDir%

del cmd.txt

echo cd %sshProjectDir%> cmd.txt
echo unzip %sshProjectName%.zip>> cmd.txt

echo rm -f %sshProjectName%.zip>> cmd.txt

putty.exe -pw %sshPwd% -ssh %sshRoot%@%sshIp% -m cmd.txt

del cmd.txt

del ..\build\%sshProjectName%.zip

rd /q /s ..\build\%sshProjectName%

pause