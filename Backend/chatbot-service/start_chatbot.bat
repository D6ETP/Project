@echo off
title EasyTravel Chatbot Service (8085)

cd /d "%~dp0"

echo =========================================
echo   EasyTravel AI Chatbot Service (8085)
echo =========================================
echo.

REM --- Check Python availability ---
where python >nul 2>&1
if %errorlevel% neq 0 (
    where py >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Python is not found in PATH.
        echo Please ensure Python 3.10+ is installed.
        pause
        exit /b 1
    )
    set "PYTHON_CMD=py"
) else (
    set "PYTHON_CMD=python"
)

REM --- Setup Virtual Environment if missing ---
if not exist "venv\Scripts\activate.bat" (
    echo [INFO] Creating Python virtual environment...
    %PYTHON_CMD% -m venv venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
)

echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

REM --- Install requirements if needed ---
if not exist "venv\.installed" (
    echo [INFO] Installing required Python packages...
    pip install -r requirements.txt
    if %errorlevel% equ 0 (
        echo packages installed > venv\.installed
    ) else (
        echo [WARNING] Package installation encountered errors.
    )
)

echo.
echo [INFO] Starting FastAPI Chatbot on http://localhost:8085 ...
python -m uvicorn main:app --host 0.0.0.0 --port 8085 --reload

pause