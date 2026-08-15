@echo off
setlocal EnableDelayedExpansion

echo =====================================================
echo   EasyTravel - Stopping All Microservices
echo =====================================================
echo.

set "PORTS=8761 8080 8081 8082 8083 8084 8085 8086 5173 5174 3000"

echo [1/2] Terminating listening processes on service ports...
powershell -NoProfile -Command ^
    "$ports = @(8761, 8080, 8081, 8082, 8083, 8084, 8085, 8086, 5173, 5174, 3000);" ^
    "foreach ($p in $ports) {" ^
    "    $conns = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue;" ^
    "    if ($conns) {" ^
    "        foreach ($c in $conns) {" ^
    "            try {" ^
    "                $proc = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue;" ^
    "                $name = if ($proc) { $proc.ProcessName } else { 'Unknown' };" ^
    "                Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue;" ^
    "                Write-Host ('  [KILLED] Port ' + $p + ' (PID: ' + $c.OwningProcess + ' - ' + $name + ')');" ^
    "            } catch {}" ^
    "        }" ^
    "    } else {" ^
    "        Write-Host ('  [CLEAN]  Port ' + $p + ' is free');" ^
    "    }" ^
    "}"

echo.
echo [2/2] Final verification with netstat/taskkill...
for %%P in (%PORTS%) do (
    for /f "tokens=5" %%A in ('netstat -ano ^| findstr /r /c:":%%P .*LISTENING" 2^>nul') do (
        taskkill /F /T /PID %%A >nul 2>&1
    )
)

echo.
echo =====================================================
echo   All EasyTravel services have been stopped!
echo =====================================================
echo.
pause
