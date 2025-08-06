@echo off
REM 🪟 INSTALACIÓN RENDER CLI PARA WINDOWS

echo 🚀 Instalando Render CLI en Windows...
echo.

REM Verificar si PowerShell está disponible
powershell -Command "Write-Host 'PowerShell disponible'" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PowerShell no está disponible
    pause
    exit /b 1
)

echo 📦 MÉTODO 1: Instalación con PowerShell (Recomendado)
echo ⬇️ Descargando e instalando Render CLI...
powershell -Command "iwr -useb https://cli.render.com/install.ps1 | iex"

REM Verificar si la instalación fue exitosa
render --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ ¡Render CLI instalado exitosamente con PowerShell!
    echo 📋 Versión instalada:
    render --version
    goto :success
)

echo.
echo 📦 MÉTODO 2: Intentando con Chocolatey...
choco --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📥 Instalando Chocolatey...
    powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
)

echo ⬇️ Instalando Render CLI con Chocolatey...
choco install render-cli -y

REM Verificar instalación con Chocolatey
render --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ ¡Render CLI instalado exitosamente con Chocolatey!
    echo 📋 Versión instalada:
    render --version
    goto :success
)

echo.
echo 📦 MÉTODO 3: Descarga manual...
mkdir C:\render-cli 2>nul
cd C:\render-cli

echo ⬇️ Descargando ejecutable...
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/render-oss/cli/releases/latest/download/render-windows-amd64.exe' -OutFile 'render.exe'"

REM Agregar al PATH
setx PATH "%PATH%;C:\render-cli" /M >nul 2>&1

echo ✅ Render CLI descargado en C:\render-cli\render.exe
echo 📝 Agregado al PATH del sistema

:success
echo.
echo 🎉 ¡INSTALACIÓN COMPLETADA!
echo.
echo 🔐 Próximos pasos:
echo 1. render auth login
echo 2. render auth whoami
echo 3. render services list
echo.
echo 🚀 Para desplegar tu WhatsApp Bot Panel:
echo render services create web --name whatsapp-bot-panel --repo https://gitlab.com/melodiabl-group/whatsapp-bot-panel --branch render-optimized --plan free
echo.
pause
