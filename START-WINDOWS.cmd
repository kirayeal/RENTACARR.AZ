@echo off
setlocal
pushd "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is missing. Install Node.js LTS from https://nodejs.org and try again.
  pause
  exit /b 1
)
echo Installing project dependencies...
call npm ci
if errorlevel 1 (
  echo Installation failed. Check your Internet connection and the error above.
  pause
  exit /b 1
)
echo Open the Local address shown below in your browser. Keep this window open.
call npm run dev -- --port 3000
pause
