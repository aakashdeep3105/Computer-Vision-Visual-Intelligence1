@echo off
setlocal
echo =======================================================
echo Pushing VisionInsight AI to GitHub Repository...
echo Repository: https://github.com/aakashdeep3105/Computer-Vision-Visual-Intelligence1.git
echo =======================================================

set GIT_EXE="%LOCALAPPDATA%\MinGit\cmd\git.exe"
if not exist %GIT_EXE% set GIT_EXE=git

%GIT_EXE% push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =======================================================
    echo [SUCCESS] Repository pushed to GitHub!
    echo =======================================================
) else (
    echo.
    echo =======================================================
    echo GitHub requires your credentials to complete the push.
    echo Please authenticate when prompted by GitHub.
    echo =======================================================
)

pause
