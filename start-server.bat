@echo off
title CyneX Bank - Database & API Server
echo ========================================================
echo        CYNEX BANK - DATABASE & API SERVER
echo ========================================================
echo.
echo Starting Node.js Relational Database & REST API on port 3000...
echo.
node server.js
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is not recognized in your PATH.
    echo Please ensure Node.js is installed to run the backend API server.
    echo In the meantime, the web app works seamlessly in Local Mode!
    echo.
    pause
)
