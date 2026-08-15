@echo off
setlocal EnableDelayedExpansion

REM ── Store root path safely (handles spaces & parentheses in path) ──
set "ROOT=%~dp0"
set "ENVFILE=%ROOT%.env"

echo =====================================================
echo   EasyTravel - Loading Environment Variables
echo =====================================================

REM ── Check .env exists ─────────────────────────────────
if not exist "!ENVFILE!" (
    echo ERROR: .env file not found.
    echo Expected at: !ENVFILE!
    echo Please create it from .env.example
    pause
    exit /b 1
)

REM ── Parse .env: skip lines starting with # or blank ──
for /f "usebackq tokens=1,* delims==" %%A in ("!ENVFILE!") do (
    set "_key=%%A"
    set "_val=%%B"
    if not "!_key:~0,1!"=="#" if not "!_key!"=="" (
        set "!_key!=!_val!"
    )
)

echo   [OK] DB_USERNAME         = !DB_USERNAME!
echo   [OK] DB_PASSWORD         = (loaded)
echo   [OK] JWT_SECRET          = (loaded)
echo   [OK] GMAIL_USERNAME      = !GMAIL_USERNAME!
echo   [OK] GMAIL_APP_PASSWORD  = (loaded)
echo   [OK] GEMINI_API_KEY      = (loaded)
echo   [OK] OPENWEATHER_API_KEY = (loaded)
echo   [OK] API_GATEWAY_URL     = !API_GATEWAY_URL!
echo.

echo =====================================================
echo   EasyTravel - Starting All Microservices
echo =====================================================
echo.

echo [1/9] Starting Eureka Server (8761)...
start "Eureka Server (8761)" cmd /k "title Eureka Server (8761) && cd /d "!ROOT!Backend\eureka-server" && call mvnw.cmd spring-boot:run"
echo      Waiting 20 seconds for Eureka Server to initialize...
timeout /t 20 /nobreak >nul

echo [2/9] Starting Auth Service (8081)...
start "Auth Service (8081)" cmd /k "title Auth Service (8081) && set DB_USERNAME=!DB_USERNAME!&& set DB_PASSWORD=!DB_PASSWORD!&& set JWT_SECRET=!JWT_SECRET!&& cd /d "!ROOT!Backend\auth-service" && call mvnw.cmd spring-boot:run"

echo [3/9] Starting Booking Service (8082)...
start "Booking Service (8082)" cmd /k "title Booking Service (8082) && set DB_USERNAME=!DB_USERNAME!&& set DB_PASSWORD=!DB_PASSWORD!&& cd /d "!ROOT!Backend\booking-service" && call mvnw.cmd spring-boot:run"

echo [4/9] Starting Admin Service (8083)...
start "Admin Service (8083)" cmd /k "title Admin Service (8083) && set DB_USERNAME=!DB_USERNAME!&& set DB_PASSWORD=!DB_PASSWORD!&& cd /d "!ROOT!Backend\admin-service" && call mvnw.cmd spring-boot:run"

echo [5/9] Starting API Gateway (8080)...
start "API Gateway (8080)" cmd /k "title API Gateway (8080) && set JWT_SECRET=!JWT_SECRET!&& cd /d "!ROOT!Backend\api-gateway" && call mvnw.cmd spring-boot:run"

echo [6/9] Starting Notification Service (8084)...
start "Notification Service (8084)" cmd /k "title Notification Service (8084) && set GMAIL_USERNAME=!GMAIL_USERNAME!&& set GMAIL_APP_PASSWORD=!GMAIL_APP_PASSWORD!&& cd /d "!ROOT!Backend\notification-service" && call mvnw.cmd spring-boot:run"

echo [7/9] Starting .NET Logging Service (8086)...
start "Logging Service (8086)" cmd /k "title Logging Service (8086) && cd /d "!ROOT!Backend\LoggingService\LoggingService" && dotnet run"

echo [8/9] Starting AI Chatbot Service (8085 - Python/Gemini)...
start "Chatbot Service (8085)" cmd /k "title AI Chatbot Service (8085) && set GEMINI_API_KEY=!GEMINI_API_KEY!&& set OPENWEATHER_API_KEY=!OPENWEATHER_API_KEY!&& set API_GATEWAY_URL=!API_GATEWAY_URL!&& cd /d "!ROOT!Backend\chatbot-service" && call start_chatbot.bat"

echo.
timeout /t 5 /nobreak >nul

echo [9/9] Starting React Frontend (5173)...
start "Frontend (5173)" cmd /k "title Frontend (5173) && cd /d "!ROOT!frontend" && if not exist "node_modules\" (call npm install) & call npm run dev"

echo.
echo =====================================================
echo   All 9 services are launching!
echo =====================================================
echo.
echo   Eureka Dashboard : http://localhost:8761
echo   API Gateway      : http://localhost:8080
echo   Auth Service     : http://localhost:8081
echo   Booking Service  : http://localhost:8082
echo   Admin Service    : http://localhost:8083
echo   Notification     : http://localhost:8084
echo   AI Chatbot       : http://localhost:8085
echo   Logging Service  : http://localhost:8086
echo   Frontend         : http://localhost:5173
echo.
echo   Secrets loaded from .env - DO NOT commit it to git!
echo =====================================================
pause
