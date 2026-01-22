@echo off
REM Windows Development Setup Script
REM Idempotent - safe to run multiple times

echo ========================================
echo Windows Development Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found.
    echo.
    echo Please install Node.js 22+ from:
    echo https://nodejs.org/
    echo.
    echo Or use nvm-windows:
    echo https://github.com/coreybutler/nvm-windows
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Node.js already installed: %NODE_VERSION%
)

REM Check if nvm-windows is installed
if exist "%USERPROFILE%\AppData\Roaming\nvm\nvm.exe" (
    echo [OK] nvm-windows detected
    call "%USERPROFILE%\AppData\Roaming\nvm\nvm.exe" use 22.0.0 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [INFO] Installing Node.js 22 via nvm-windows...
        call "%USERPROFILE%\AppData\Roaming\nvm\nvm.exe" install 22.0.0
        call "%USERPROFILE%\AppData\Roaming\nvm\nvm.exe" use 22.0.0
    )
) else (
    echo [INFO] nvm-windows not found. Using system Node.js.
)

REM Check if pnpm is installed
where pnpm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installing pnpm...
    call npm install -g pnpm
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install pnpm. Please install manually:
        echo npm install -g pnpm
        pause
        exit /b 1
    )
) else (
    for /f "tokens=*" %%i in ('pnpm --version') do set PNPM_VERSION=%%i
    echo [OK] pnpm already installed: v%PNPM_VERSION%
)

REM Install project dependencies
if exist "pnpm-lock.yaml" (
    echo [INFO] Installing project dependencies...
    call pnpm install
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Dependencies installed
    ) else (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo [WARN] No pnpm-lock.yaml found. Run 'pnpm install' manually.
)

REM Check if Git is installed
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Git not found. Install from:
    echo https://git-scm.com/download/win
) else (
    for /f "tokens=*" %%i in ('git --version') do set GIT_VERSION=%%i
    echo [OK] Git installed: %GIT_VERSION%
)

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Next steps:
echo   pnpm dev    - Start development server
echo   pnpm build  - Build for production
echo   pnpm lint   - Run linter
echo   pnpm format - Format code
echo.
pause
