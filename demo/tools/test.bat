@echo off

ren ..\build\web-mobile  ZCodeDev 

7z.exe a ..\..\buildVeision\%version%.zip ..\build\ZCodeDev

pause