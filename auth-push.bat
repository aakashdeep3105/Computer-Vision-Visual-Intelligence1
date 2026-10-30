@echo off
setlocal
echo =======================================================
echo VisionInsight AI - GitHub Authentication & Push Helper
echo =======================================================
echo.

set GH_EXE="%LOCALAPPDATA%\gh_cli\bin\gh.exe"
set GIT_EXE="%LOCALAPPDATA%\MinGit\cmd\git.exe"

echo Step 1: Logging in to GitHub...
%GH_EXE% auth login -p https -h github.com --web -s repo

echo.
echo Step 2: Configuring Git credentials...
%GH_EXE% auth setup-git

echo.
echo Step 3: Pushing code to https://github.com/aakashdeep3105/Computer-Vision-Visual-Intelligence1.git...
%GIT_EXE% push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =======================================================
    echo [SUCCESS] Pushed successfully to GitHub!
    echo =======================================================
) else (
    echo.
    echo [ERROR] Push failed. Please check the error above.
)

pause

