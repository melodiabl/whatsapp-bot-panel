@echo off
echo ========================================
echo    SUBIR A GITHUB - AUTOMATICO
echo ========================================
echo.

echo [1/4] Agregando archivos al commit...
git add .

echo.
echo [2/4] Creando commit...
git commit -m "Sistema completo: Registro automatico + Panel + IA + Logs + Deploy 24/7"

echo.
echo [3/4] Configurando GitHub...
echo.
echo IMPORTANTE: Necesitas crear el repositorio en GitHub primero:
echo 1. Ve a github.com
echo 2. Click "New repository"
echo 3. Nombre: whatsapp-bot-panel-completo
echo 4. Publico (para Replit gratis)
echo 5. NO marcar README, .gitignore, license
echo 6. Copiar la URL que aparece
echo.

set /p GITHUB_URL="Pega aqui la URL de tu repositorio GitHub: "

echo.
echo [4/4] Agregando remote y subiendo...
git remote add origin %GITHUB_URL%
git push -u origin main

echo.
echo ========================================
echo           SUBIDA COMPLETADA
echo ========================================
echo.
echo Tu codigo esta ahora en GitHub!
echo.
echo SIGUIENTE PASO: Usar en Replit
echo 1. Ve a replit.com
echo 2. "Create Repl" -> "Import from GitHub"
echo 3. Pega la URL: %GITHUB_URL%
echo 4. Language: Node.js
echo 5. Seguir la guia: SUBIR_A_GITHUB_COMPLETO.md
echo.
echo URLs importantes:
echo - GitHub: %GITHUB_URL%
echo - Guia completa: SUBIR_A_GITHUB_COMPLETO.md
echo.
pause
