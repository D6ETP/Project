@echo off
title EasyTravel Chatbot Service (8085)

cd /d "%~dp0"

echo =========================================
echo EasyTravel AI Chatbot Service
echo =========================================

python --version
if %errorlevel% neq 0 (
    echo Python is not installed.
    pause
    exit /b
)

if not exist "venv" (
    python -m venv venv
)

call venv\Scripts\activate.bat

pip install -r requirements.txt

uvicorn main:app --host 0.0.0.0 --port 8085 --reload

pause