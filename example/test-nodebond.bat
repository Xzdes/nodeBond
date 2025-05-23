@echo off
setlocal enabledelayedexpansion

REM ================================
REM     nodeBond Full Test Script
REM ================================

set TOKEN=secret123
set NODEBOND_TOKEN=%TOKEN%

echo [TEST] nodeBond FULL SYSTEM CHECK
echo ---------------------------------------

REM === Launch Hub ===
echo [STEP] Launching HUB...
start "hub" cmd /k "echo [hub] Starting... && set NODEBOND_TOKEN=%TOKEN% && nodebond start-hub"
timeout /t 2 >nul

REM === Launch DB Service ===
echo [STEP] Launching DB SERVICE...
start "db" cmd /k "echo [db] Starting... && set NODEBOND_TOKEN=%TOKEN% && node db-service\index.js"
timeout /t 2 >nul

REM === Launch PRINTER Service ===
echo [STEP] Launching PRINTER SERVICE...
start "printer" cmd /k "echo [printer] Starting... && set NODEBOND_TOKEN=%TOKEN% && node printer-service\index.js"
timeout /t 2 >nul

REM === Call ping on db ===
echo ---------------------------------------
echo [STEP] Calling db.ping
nodebond call db.ping

REM === Set variable ===
echo ---------------------------------------
echo [STEP] Setting printer.status = "ready"
nodebond set printer.status "\"ready\""

REM === Get variable ===
echo ---------------------------------------
echo [STEP] Getting printer.status
nodebond get printer.status

REM === Watch in separate window ===
echo ---------------------------------------
echo [STEP] Subscribing to printer.status...
start "watch" cmd /k "echo [watch] Subscribing... && set NODEBOND_TOKEN=%TOKEN% && nodebond watch printer.status"
timeout /t 2 >nul

REM === Trigger update ===
echo ---------------------------------------
echo [STEP] Updating printer.status to "printing"
nodebond set printer.status "\"printing\""

REM === Trigger another update ===
timeout /t 2 >nul
echo [STEP] Updating printer.status to "done"
nodebond set printer.status "\"done\""

REM === Done ===
echo ---------------------------------------
echo [DONE] All tests executed.
echo [INFO] You may now close all the opened test windows.
pause
