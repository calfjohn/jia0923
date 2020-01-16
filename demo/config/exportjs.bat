@echo off
set pathPath=%~dp0
set sourecePath=table
set bkSourcePath=bkTable

if exist "%pathPath%%bkSourcePath%" rd /S/Q %pathPath%%bkSourcePath%
if not exist "%pathPath%%bkSourcePath%" md %pathPath%%bkSourcePath%

xcopy /q /s /e /c /y /h /r "%pathPath%%sourecePath%\*.*"  "%pathPath%%bkSourcePath%\" 
cd ./tool/
call exportjs.bat %bkSourcePath%
cd ../

if exist "%pathPath%%bkSourcePath%" rd /S/Q %pathPath%%bkSourcePath%
pause
