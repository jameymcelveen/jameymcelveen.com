@echo off
REM Windows Makefile Equivalent
REM Usage: Makefile.bat [target]

setlocal enabledelayedexpansion

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="setup" goto setup
if "%1"=="install" goto install
if "%1"=="dev" goto dev
if "%1"=="build" goto build
if "%1"=="start" goto start
if "%1"=="lint" goto lint
if "%1"=="format" goto format
if "%1"=="format-check" goto format-check
if "%1"=="clean" goto clean

echo Unknown target: %1
goto help

:help
echo Available targets:
echo   Makefile.bat setup        - Run Windows setup script
echo   Makefile.bat install      - Install dependencies
echo   Makefile.bat dev          - Start development server
echo   Makefile.bat build        - Build for production
echo   Makefile.bat start        - Start production server
echo   Makefile.bat lint         - Run ESLint
echo   Makefile.bat format       - Format code with Prettier
echo   Makefile.bat format-check - Check code formatting
echo   Makefile.bat clean        - Clean build artifacts
goto end

:setup
echo Running Windows setup...
call scripts\dev-setup-windows.bat
goto end

:install
echo Installing dependencies...
call pnpm install
goto end

:dev
echo Starting development server...
call pnpm dev
goto end

:build
echo Building for production...
call pnpm build
goto end

:start
echo Starting production server...
call pnpm start
goto end

:lint
echo Running ESLint...
call pnpm lint
goto end

:format
echo Formatting code...
call pnpm format
goto end

:format-check
echo Checking code formatting...
call pnpm format:check
goto end

:clean
echo Cleaning build artifacts...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out
if exist dist rmdir /s /q dist
echo Clean complete!
goto end

:end
endlocal
