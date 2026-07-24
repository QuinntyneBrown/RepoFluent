@echo off
setlocal EnableExtensions EnableDelayedExpansion

rem ---------------------------------------------------------------------------
rem RepoFluent local development launcher.
rem
rem Starts the .NET API and the Angular dev server in their own windows, waits
rem until both answer, then opens the app in Chrome.
rem
rem The API port MUST stay 5080: frontend/proxy.conf.json hardcodes
rem http://127.0.0.1:5080 as the /api proxy target, and the app issues relative
rem /api/... requests, so the dev server proxy is the only thing wiring them up.
rem
rem Run eng\stop.bat to shut everything down.
rem ---------------------------------------------------------------------------

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "ROOT=%%~fI"

set "API_PORT=5080"
set "APP_PORT=4200"
set "API_URL=http://127.0.0.1:%API_PORT%"
set "APP_URL=http://127.0.0.1:%APP_PORT%"
set "RUN_DIR=%ROOT%\.run"

echo(
echo === RepoFluent local development ===
echo   repository : %ROOT%
echo   api        : %API_URL%
echo   frontend   : %APP_URL%
echo(

rem --- prerequisites ---------------------------------------------------------
call :require dotnet || goto :failed
call :require npm    || goto :failed
call :require node   || goto :failed
call :require curl   || goto :failed

rem --- free the ports from any previous run ----------------------------------
echo [1/6] Stopping anything left over from a previous run...
call "%SCRIPT_DIR%stop.bat" --quiet

if not exist "%RUN_DIR%" mkdir "%RUN_DIR%"

rem --- frontend dependencies -------------------------------------------------
if exist "%ROOT%\frontend\node_modules" (
    echo [2/6] Frontend dependencies already installed.
) else (
    echo [2/6] Installing frontend dependencies ^(npm ci^)...
    pushd "%ROOT%\frontend"
    call npm ci
    set "NPM_EXIT=!ERRORLEVEL!"
    popd
    if not "!NPM_EXIT!"=="0" (
        echo(
        echo ERROR: npm ci failed with exit code !NPM_EXIT!.
        goto :failed
    )
)

rem --- build the backend up front so failures surface here, not in a side window
echo [3/6] Building the backend solution...
dotnet build "%ROOT%\backend\RepoFluent.sln" --nologo --verbosity quiet
if not "%ERRORLEVEL%"=="0" (
    echo(
    echo ERROR: backend build failed. Fix the build before starting.
    goto :failed
)

rem --- generate the launcher scripts ------------------------------------------
set "API_CMD=%RUN_DIR%\api-run.cmd"
set "WEB_CMD=%RUN_DIR%\web-run.cmd"

> "%API_CMD%" echo @echo off
>>"%API_CMD%" echo title RepoFluent API
>>"%API_CMD%" echo cd /d "%ROOT%\backend\src\RepoFluent.Api"
>>"%API_CMD%" echo set ASPNETCORE_ENVIRONMENT=Development
>>"%API_CMD%" echo dotnet run --no-launch-profile --no-build --urls %API_URL%
>>"%API_CMD%" echo echo.
>>"%API_CMD%" echo echo [RepoFluent] API exited with code %%ERRORLEVEL%%.
>>"%API_CMD%" echo pause

> "%WEB_CMD%" echo @echo off
>>"%WEB_CMD%" echo title RepoFluent Web
>>"%WEB_CMD%" echo cd /d "%ROOT%\frontend"
>>"%WEB_CMD%" echo call npm start -- --host 127.0.0.1 --port %APP_PORT% --proxy-config proxy.conf.json
>>"%WEB_CMD%" echo echo.
>>"%WEB_CMD%" echo echo [RepoFluent] Frontend exited with code %%ERRORLEVEL%%.
>>"%WEB_CMD%" echo pause

rem --- start the backend ------------------------------------------------------
echo [4/6] Starting the backend API...
call :spawn "%API_CMD%" API_PID || goto :failed
echo %API_PID%> "%RUN_DIR%\api.pid"
call :wait_for "%API_URL%/api/health" 120 "backend API" %API_PID% || goto :failed

rem --- start the frontend -----------------------------------------------------
echo [5/6] Starting the Angular dev server...
call :spawn "%WEB_CMD%" WEB_PID || goto :failed
echo %WEB_PID%> "%RUN_DIR%\web.pid"
call :wait_for "%APP_URL%" 240 "frontend dev server" %WEB_PID% || goto :failed

rem --- open the app in Chrome -------------------------------------------------
echo [6/6] Opening %APP_URL% in Chrome...
call :open_chrome "%APP_URL%"

echo(
echo === RepoFluent is running ===
echo   frontend : %APP_URL%   ^(pid %WEB_PID%^)
echo   api      : %API_URL%   ^(pid %API_PID%^)
echo   openapi  : %API_URL%/openapi/v1.json
echo(
echo Sign in with the Development personas ^(Author / Reviewer / Administrator / Learner^).
echo Run eng\stop.bat to shut everything down.
echo(
endlocal
exit /b 0

rem ===========================================================================
rem Helpers
rem ===========================================================================

:require
where %1 >nul 2>&1
if not "%ERRORLEVEL%"=="0" (
    echo ERROR: '%1' was not found on PATH.
    exit /b 1
)
exit /b 0

rem :spawn <script> <pid-var> -- launches the script in its own window and
rem returns the launcher PID, whose process tree stop.bat can terminate.
:spawn
set "SPAWN_PID="
for /f "usebackq delims=" %%P in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "(Start-Process -FilePath '%~1' -PassThru).Id"`) do set "SPAWN_PID=%%P"
if not defined SPAWN_PID (
    echo ERROR: failed to start %~nx1.
    exit /b 1
)
set "%2=%SPAWN_PID%"
exit /b 0

rem :wait_for <url> <seconds> <label> <pid> -- polls until the URL answers,
rem failing fast if the process behind it died.
:wait_for
set "WAIT_URL=%~1"
set "WAIT_MAX=%~2"
set "WAIT_LABEL=%~3"
set "WAIT_PID=%~4"
set /a WAIT_ELAPSED=0
<nul set /p "=      waiting for %WAIT_LABEL% "
:wait_loop
curl --silent --output NUL --max-time 3 "%WAIT_URL%" >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    echo  ready.
    exit /b 0
)
tasklist /FI "PID eq %WAIT_PID%" 2>nul | find "%WAIT_PID%" >nul
if not "%ERRORLEVEL%"=="0" (
    echo(
    echo ERROR: the %WAIT_LABEL% process exited before it became ready.
    echo        Check its window for the failure.
    exit /b 1
)
if %WAIT_ELAPSED% GEQ %WAIT_MAX% (
    echo(
    echo ERROR: %WAIT_LABEL% did not answer %WAIT_URL% within %WAIT_MAX% seconds.
    exit /b 1
)
<nul set /p "=."
ping -n 3 127.0.0.1 >nul
set /a WAIT_ELAPSED+=2
goto :wait_loop

:open_chrome
set "CHROME="
set "PF86=%ProgramFiles(x86)%"
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined CHROME if exist "%PF86%\Google\Chrome\Application\chrome.exe" set "CHROME=%PF86%\Google\Chrome\Application\chrome.exe"
if not defined CHROME if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if defined CHROME (
    start "" "%CHROME%" "%~1"
) else (
    echo       Chrome was not found; opening in the default browser instead.
    start "" "%~1"
)
exit /b 0

:failed
echo(
echo === Startup aborted ===
echo(
endlocal
exit /b 1
