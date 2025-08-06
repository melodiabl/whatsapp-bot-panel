@echo off
echo ========================================
echo    SUBIR A GITHUB CON GITHUB CLI
echo ========================================
echo.
echo Verificando GitHub CLI...
gh --version
if %errorlevel% neq 0 (
    echo ERROR: GitHub CLI no esta instalado o no esta en el PATH
    echo.
    echo SOLUCION:
    echo 1. Cierra esta terminal
    echo 2. Abre una nueva terminal como administrador
    echo 3. Ejecuta: winget install --id GitHub.cli
    echo 4. Reinicia la terminal y ejecuta este script de nuevo
    echo.
    pause
    exit /b 1
)

echo.
echo GitHub CLI encontrado! Procediendo...
echo.

echo Autenticando con GitHub...
gh auth login

echo.
echo Creando repositorio en GitHub...
gh repo create whatsapp-bot-panel --public --description "WhatsApp Bot Panel con React y Node.js"

echo.
echo Configurando repositorio local...
git branch -M main
git remote add origin https://github.com/%USERNAME%/whatsapp-bot-panel.git

echo.
echo Subiendo codigo a GitHub...
git push -u origin main

echo.
echo ========================================
echo           EXITO!
echo ========================================
echo.
echo Tu repositorio esta en:
echo https://github.com/%USERNAME%/whatsapp-bot-panel
echo.
echo Ahora puedes ir a render.com para desplegarlo
echo.
pause
