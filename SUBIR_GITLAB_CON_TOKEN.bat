@echo off
chcp 65001 >nul
cls

echo ========================================
echo   SUBIR A GITLAB CON TOKEN PERSONAL
echo ========================================
echo.

echo 🔐 NECESITAS UN TOKEN PERSONAL DE GITLAB
echo.
echo 1. Ve a: https://gitlab.com/-/profile/personal_access_tokens
echo 2. Click "Add new token"
echo 3. Name: whatsapp-bot-token
echo 4. Scopes: read_repository, write_repository, api
echo 5. Click "Create personal access token"
echo 6. COPIA EL TOKEN (solo se muestra una vez)
echo.

set /p TOKEN="Pega tu token personal aquí: "

if "%TOKEN%"=="" (
    echo ❌ Error: Token vacío
    pause
    exit /b 1
)

echo.
echo 🔧 Configurando remote con token...

REM Eliminar remote actual
git remote remove origin 2>nul

REM Agregar remote con token
git remote add origin https://%TOKEN%@gitlab.com/melodiabl-group/whatsapp-bot-panel.git

echo.
echo 🚀 Subiendo proyecto a GitLab...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ ¡ÉXITO! Proyecto subido a GitLab
    echo.
    echo 📋 PRÓXIMOS PASOS:
    echo 1. Ve a: https://gitlab.com/melodiabl-group/whatsapp-bot-panel
    echo 2. Revisa el Pipeline: https://gitlab.com/melodiabl-group/whatsapp-bot-panel/-/pipelines
    echo 3. Conecta con Render para auto-deploy
    echo.
    echo 🌐 URL Final: https://whatsapp-bot-panel.onrender.com
    echo 🔑 Login: admin / admin123
) else (
    echo.
    echo ❌ Error al subir. Verifica:
    echo - Token correcto
    echo - Permisos del repositorio
    echo - Conexión a internet
)

echo.
pause
