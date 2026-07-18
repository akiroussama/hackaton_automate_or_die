@echo off
rem CableTwin demo cold-start: frozen local build + clean observation-ready browser.
rem Does not modify app, engine, tests, packaging or any tag.
setlocal
cd /d "%~dp0.."

echo [start-demo] starting local server...
start "cabletwin-server" /min cmd /c "node scripts\serve.mjs"

rem wait for the server (max ~10 s)
set TRIES=0
:wait
set /a TRIES+=1
powershell -NoProfile -Command "try { (Invoke-WebRequest -Uri http://127.0.0.1:4173/ -UseBasicParsing -TimeoutSec 1) | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if %errorlevel%==0 goto up
if %TRIES% geq 20 ( echo [start-demo] ERROR: server did not answer & exit /b 1 )
ping -n 2 127.0.0.1 >nul
goto wait

:up
echo [start-demo] server up; opening demo browser...
set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist %CHROME% set CHROME="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
start "" %CHROME% --new-window --remote-debugging-port=9230 ^
  --user-data-dir="%TEMP%\cabletwin-demo-profile" --no-first-run ^
  --disable-features=TranslateUI --window-size=1920,1080 http://127.0.0.1:4173/
echo [start-demo] ready. Flight recorder can attach on port 9230.
endlocal
