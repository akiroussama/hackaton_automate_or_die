@echo off
rem CableTwin demo cold-start (hardened per Codex iteration-2 correction block).
rem   start-demo.cmd        cold-start server + observation-ready browser
rem   start-demo.cmd stop   deterministic cleanup (browser, server, profile)
rem Never modifies app, engine, tests, packaging or any tag.
setlocal EnableDelayedExpansion
cd /d "%~dp0.."

if /i "%~1"=="stop" goto cleanup

powershell -NoProfile -Command "[DateTime]::Now.Ticks" > "%TEMP%\cabletwin-demo-t0.txt"

rem -- 1. both ports must be free: never adopt an unknown/stale listener
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 4173 -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }"
if errorlevel 1 ( echo [start-demo] FAIL: port 4173 already occupied. Run 'start-demo.cmd stop' first. & exit /b 1 )
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 9230 -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }"
if errorlevel 1 ( echo [start-demo] FAIL: CDP port 9230 already occupied. Run 'start-demo.cmd stop' first. & exit /b 1 )

rem -- 2. a supported browser must exist
set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist "%CHROME%" ( echo [start-demo] FAIL: neither Chrome nor Edge found. & exit /b 1 )

rem -- 3. start the frozen local server
echo [start-demo] starting local server...
start "cabletwin-server" /min cmd /c "node scripts\serve.mjs"

rem -- 4. wait for CableTwin identity + assets (not just any HTTP 200)
powershell -NoProfile -Command ^
  "$ok=$false; foreach ($i in 1..40) { try { $r=Invoke-WebRequest -Uri 'http://127.0.0.1:4173/' -UseBasicParsing -TimeoutSec 1; if ($r.StatusCode -eq 200 -and $r.Content -match 'CableTwin') { $css=Invoke-WebRequest -Uri 'http://127.0.0.1:4173/app/styles.css' -UseBasicParsing -TimeoutSec 1; $eng=Invoke-WebRequest -Uri 'http://127.0.0.1:4173/engine/twin-engine.js' -UseBasicParsing -TimeoutSec 1; if ($css.StatusCode -eq 200 -and $eng.StatusCode -eq 200) { $ok=$true; break } } } catch {}; Start-Sleep -Milliseconds 250 }; if ($ok) { exit 0 } else { exit 1 }"
if errorlevel 1 ( echo [start-demo] FAIL: CableTwin server identity/assets not verified. & goto failstop )

rem -- 5. unique disposable profile; CDP bound to loopback only
set "DEMO_PROFILE=%TEMP%\cabletwin-demo-%RANDOM%%RANDOM%"
echo %DEMO_PROFILE%> "%TEMP%\cabletwin-demo-profile-path.txt"
echo [start-demo] opening demo browser (profile %DEMO_PROFILE%)...
start "" "%CHROME%" --new-window --remote-debugging-port=9230 --remote-debugging-address=127.0.0.1 ^
  --user-data-dir="%DEMO_PROFILE%" --no-first-run --no-default-browser-check ^
  --disable-features=TranslateUI --window-size=1920,1080 http://127.0.0.1:4173/

rem -- 6. wait for CDP /json/version AND the exact CableTwin page target
powershell -NoProfile -Command ^
  "$ok=$false; foreach ($i in 1..60) { try { Invoke-RestMethod -Uri 'http://127.0.0.1:9230/json/version' -TimeoutSec 1 | Out-Null; $tabs=Invoke-RestMethod -Uri 'http://127.0.0.1:9230/json/list' -TimeoutSec 1; $t=$tabs | Where-Object { $_.type -eq 'page' -and $_.url -eq 'http://127.0.0.1:4173/' -and $_.title -match 'CableTwin' }; if ($t) { $ok=$true; break } } catch {}; Start-Sleep -Milliseconds 250 }; if ($ok) { exit 0 } else { exit 1 }"
if errorlevel 1 ( echo [start-demo] FAIL: CDP target with CableTwin identity not confirmed. & goto failstop )

rem -- 7. total observation-ready time vs the 15-second limit
powershell -NoProfile -Command ^
  "$t0=[long](Get-Content $env:TEMP\cabletwin-demo-t0.txt); $dt=([DateTime]::Now.Ticks - $t0) / 1e7; Write-Host ('[start-demo] observation-ready in {0:N1}s (limit 15s)' -f $dt); if ($dt -le 15) { exit 0 } else { exit 1 }"
if errorlevel 1 ( echo [start-demo] FAIL: cold start exceeded 15 seconds. & goto failstop )

echo [start-demo] READY. Flight recorder: node phase3\rehearse-demo.mjs
echo [start-demo] Cleanup after the session: phase3\start-demo.cmd stop
endlocal
exit /b 0

:failstop
call "%~f0" stop >nul 2>&1
exit /b 1

:cleanup
echo [start-demo] cleanup: closing demo browser, server and disposable profile...
powershell -NoProfile -Command ^
  "Get-NetTCPConnection -LocalPort 9230 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -Confirm:$false -ErrorAction SilentlyContinue }; Get-NetTCPConnection -LocalPort 4173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -Confirm:$false -ErrorAction SilentlyContinue }"
if exist "%TEMP%\cabletwin-demo-profile-path.txt" (
  set /p DEMO_PROFILE=<"%TEMP%\cabletwin-demo-profile-path.txt"
  if exist "!DEMO_PROFILE!" powershell -NoProfile -Command "Start-Sleep 1; Remove-Item -Recurse -Force -Confirm:$false '!DEMO_PROFILE!' -ErrorAction SilentlyContinue"
  del "%TEMP%\cabletwin-demo-profile-path.txt" >nul 2>&1
)
echo [start-demo] cleanup done.
endlocal
exit /b 0
