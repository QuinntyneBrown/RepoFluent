@echo off
setlocal EnableExtensions EnableDelayedExpansion

rem ---------------------------------------------------------------------------
rem Shuts down whatever eng\start.bat started.
rem
rem Three passes, so it still works if the PID files are missing or stale:
rem   1. kill the recorded launcher process trees
rem   2. kill whatever is still listening on the dev ports
rem   3. kill leftover windows by title
rem
rem Pass --quiet to suppress the "nothing was running" chatter (start.bat does).
rem ---------------------------------------------------------------------------

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "ROOT=%%~fI"

set "API_PORT=5080"
set "APP_PORT=4200"
set "RUN_DIR=%ROOT%\.run"

set "QUIET="
if /i "%~1"=="--quiet" set "QUIET=1"
if /i "%~1"=="-q" set "QUIET=1"

set /a KILLED=0

if not defined QUIET echo(
if not defined QUIET echo === Stopping RepoFluent ===

rem --- pass 1: recorded launcher process trees --------------------------------
call :kill_pid_file "%RUN_DIR%\api.pid" "backend API"
call :kill_pid_file "%RUN_DIR%\web.pid" "frontend dev server"

rem --- pass 2: anything still holding the dev ports ---------------------------
call :kill_port %API_PORT% "backend API"
call :kill_port %APP_PORT% "frontend dev server"

rem --- pass 3: leftover windows -----------------------------------------------
call :kill_title "RepoFluent API"
call :kill_title "RepoFluent Web"

if not defined QUIET (
    echo(
    if %KILLED% EQU 0 (
        echo Nothing was running.
    ) else (
        echo Stopped %KILLED% process^(es^).
    )
    echo(
)

endlocal
exit /b 0

rem ===========================================================================
rem Helpers
rem ===========================================================================

:kill_pid_file
if not exist "%~1" exit /b 0
set "PID="
for /f "usebackq delims=" %%P in ("%~1") do set "PID=%%P"
del "%~1" >nul 2>&1
if not defined PID exit /b 0
call :kill_tree "%PID%" "%~2 - pid %PID%"
exit /b 0

:kill_port
set "PORT=%~1"
for /f "tokens=5" %%P in ('netstat -ano -p tcp ^| findstr /r /c:":%PORT% .*LISTENING"') do (
    if not "%%P"=="0" call :kill_tree "%%P" "%~2 on port %PORT% - pid %%P"
)
exit /b 0

:kill_tree
tasklist /FI "PID eq %~1" 2>nul | find "%~1" >nul
if not "%ERRORLEVEL%"=="0" exit /b 0
taskkill /PID %~1 /T /F >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    set /a KILLED+=1
    if not defined QUIET echo   stopped %~2
)
exit /b 0

:kill_title
tasklist /FI "WINDOWTITLE eq %~1" 2>nul | find /i "cmd.exe" >nul
if not "%ERRORLEVEL%"=="0" exit /b 0
taskkill /FI "WINDOWTITLE eq %~1" /T /F >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    set /a KILLED+=1
    if not defined QUIET echo   closed leftover window "%~1"
)
exit /b 0
