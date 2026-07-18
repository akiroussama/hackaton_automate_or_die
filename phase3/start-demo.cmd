@echo off
rem CableTwin demo cold-start v3 (owned-session, fail-closed).
rem   start-demo.cmd        cold-start server + observation-ready browser
rem   start-demo.cmd stop   deterministic cleanup of THIS session only
rem Never modifies app, engine, tests, packaging or any tag.
setlocal
cd /d "%~dp0.."
set "SESSION_ROOT=%TEMP%\cabletwin-demo-session"

if /i "%~1"=="stop" goto cleanup

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$root=$env:TEMP + '\cabletwin-demo-session';" ^
  "$sw=[Diagnostics.Stopwatch]::StartNew(); $deadline={ if ($sw.ElapsedMilliseconds -gt 15000) { Write-Host '[start-demo] FAIL: 15-second observation-ready deadline exceeded.'; exit 3 } };" ^
  "if (Test-Path ($root + '\manifest.json')) { Write-Host '[start-demo] FAIL: a session manifest already exists. Finish or stop the previous owned session first (start-demo.cmd stop).'; exit 1 };" ^
  "foreach ($p in 4173, 9230) { if (Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue) { Write-Host ('[start-demo] FAIL: port {0} is in use by another application. Close that application yourself; this launcher will NOT kill unknown processes.' -f $p); exit 1 } };" ^
  "$chrome='C:\Program Files\Google\Chrome\Application\chrome.exe'; if (-not (Test-Path $chrome)) { $chrome='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' }; if (-not (Test-Path $chrome)) { Write-Host '[start-demo] FAIL: neither Chrome nor Edge found.'; exit 1 };" ^
  "New-Item -ItemType Directory -Force $root | Out-Null;" ^
  "$profile=Join-Path $root ('profile-' + [guid]::NewGuid().ToString('N').Substring(0,10));" ^
  "Write-Host '[start-demo] starting owned local server...';" ^
  "$server=Start-Process node -ArgumentList 'scripts\serve.mjs' -WorkingDirectory (Get-Location) -WindowStyle Hidden -PassThru;" ^
  "$ok=$false; while (-not $ok) { & $deadline; try { $r=Invoke-WebRequest -Uri 'http://127.0.0.1:4173/' -UseBasicParsing -TimeoutSec 1; $ok=($r.StatusCode -eq 200 -and $r.Content -match 'CableTwin') } catch {}; if (-not $ok) { Start-Sleep -Milliseconds 200 } };" ^
  "$assets=@{ '/app/styles.css'='gantt'; '/app/app.js'='approveRecoveryPlan'; '/engine/factory-data.js'='createFactoryScenario'; '/engine/twin-engine.js'='validateSchedule' };" ^
  "foreach ($k in $assets.Keys) { & $deadline; $a=Invoke-WebRequest -Uri ('http://127.0.0.1:4173' + $k) -UseBasicParsing -TimeoutSec 2; if ($a.StatusCode -ne 200 -or $a.Content -notmatch $assets[$k]) { Write-Host ('[start-demo] FAIL: asset identity check failed for {0}.' -f $k); Stop-Process -Id $server.Id -Force -Confirm:$false -ErrorAction SilentlyContinue; exit 1 } };" ^
  "Write-Host '[start-demo] server identity verified; opening owned demo browser...';" ^
  "$browser=Start-Process $chrome -ArgumentList ('--new-window --remote-debugging-port=9230 --remote-debugging-address=127.0.0.1 --user-data-dir=\"' + $profile + '\" --no-first-run --no-default-browser-check --disable-features=TranslateUI --window-size=1920,1080 http://127.0.0.1:4173/') -PassThru;" ^
  "$ok=$false; while (-not $ok) { & $deadline; try { Invoke-RestMethod -Uri 'http://127.0.0.1:9230/json/version' -TimeoutSec 1 | Out-Null; $tabs=Invoke-RestMethod -Uri 'http://127.0.0.1:9230/json/list' -TimeoutSec 1; $t=$tabs | Where-Object { $_.type -eq 'page' -and $_.url -eq 'http://127.0.0.1:4173/' -and $_.title -match 'CableTwin' }; $ok=[bool]$t } catch {}; if (-not $ok) { Start-Sleep -Milliseconds 200 } };" ^
  "$elapsed=$sw.Elapsed.TotalSeconds;" ^
  "$srv=Get-Process -Id $server.Id;" ^
  "$bproc=Get-CimInstance Win32_Process -Filter \"Name='chrome.exe' OR Name='msedge.exe'\" | Where-Object { $_.CommandLine -like ('*' + $profile + '*') -and $_.CommandLine -like '*remote-debugging-port=9230*' } | Sort-Object CreationDate | Select-Object -First 1;" ^
  "if (-not $bproc) { Write-Host '[start-demo] FAIL: could not identify the owned browser process by its unique profile.'; Stop-Process -Id $server.Id -Force -Confirm:$false -ErrorAction SilentlyContinue; exit 1 };" ^
  "$brw=Get-Process -Id $bproc.ProcessId;" ^
  "$manifest=@{ serverPid=$server.Id; serverStart=$srv.StartTime.ToString('o'); browserPid=$brw.Id; browserStart=$brw.StartTime.ToString('o'); profile=$profile; createdAt=(Get-Date).ToString('o') };" ^
  "$manifest | ConvertTo-Json | Set-Content -Path ($root + '\manifest.json') -Encoding UTF8;" ^
  "Write-Host ('[start-demo] READY — observation-ready in {0:N1}s (limit 15s, monotonic Stopwatch).' -f $elapsed);" ^
  "Write-Host '[start-demo] Flight recorder: node phase3\rehearse-demo.mjs';" ^
  "Write-Host '[start-demo] Cleanup: phase3\start-demo.cmd stop (stops ONLY this owned session)';" ^
  "exit 0"
exit /b %errorlevel%

:cleanup
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$root=$env:TEMP + '\cabletwin-demo-session'; $mf=$root + '\manifest.json';" ^
  "if (-not (Test-Path $mf)) { Write-Host '[start-demo] stop: no owned session manifest; nothing to do (unknown listeners are never killed).'; exit 0 };" ^
  "try { $m=Get-Content $mf -Raw | ConvertFrom-Json } catch { Write-Host '[start-demo] stop: manifest unreadable; refusing any kill/delete.'; exit 1 };" ^
  "$failed=$false;" ^
  "foreach ($spec in @(@($m.serverPid,$m.serverStart,'node'), @($m.browserPid,$m.browserStart,'chrome|msedge'))) {" ^
  "  $pid2=$spec[0]; $st=$spec[1]; $namePat=$spec[2];" ^
  "  $p=Get-Process -Id $pid2 -ErrorAction SilentlyContinue;" ^
  "  if ($p) { if (($p.StartTime.ToString('o') -eq $st) -and ($p.ProcessName -match $namePat)) { try { Stop-Process -Id $pid2 -Force -Confirm:$false -ErrorAction Stop } catch { $failed=$true } } else { Write-Host ('[start-demo] stop: PID {0} identity mismatch; NOT killing.' -f $pid2) } }" ^
  "};" ^
  "Start-Sleep -Milliseconds 800;" ^
  "$profile=$m.profile;" ^
  "try { $canon=(Resolve-Path -LiteralPath $profile -ErrorAction Stop).Path } catch { $canon=$null };" ^
  "$rootCanon=(Resolve-Path -LiteralPath $root).Path;" ^
  "if ($canon -and $canon.StartsWith($rootCanon + '\') -and -not ((Get-Item -LiteralPath $canon -Force).Attributes -band [IO.FileAttributes]::ReparsePoint)) {" ^
  "  try { Remove-Item -LiteralPath $canon -Recurse -Force -Confirm:$false -ErrorAction Stop } catch { $failed=$true; Write-Host '[start-demo] stop: profile removal failed.' }" ^
  "} elseif ($canon) { Write-Host '[start-demo] stop: profile path outside the session root or a reparse point; REFUSING recursive delete.'; $failed=$true };" ^
  "if (-not $failed) { Remove-Item -LiteralPath $mf -Force -Confirm:$false -ErrorAction SilentlyContinue; Write-Host '[start-demo] cleanup done (owned session only).'; exit 0 } else { Write-Host '[start-demo] cleanup INCOMPLETE; manifest kept for inspection.'; exit 1 }"
exit /b %errorlevel%
