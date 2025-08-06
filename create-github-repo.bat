@echo off
echo ========================================
echo    CREAR REPOSITORIO EN GITHUB
echo ========================================
echo.
echo Tu proyecto ya esta listo para subir!
echo.
echo OPCION 1 - MANUAL (RECOMENDADO):
echo 1. Ve a: https://github.com/new
echo 2. Repository name: whatsapp-bot-panel
echo 3. Description: WhatsApp Bot Panel con React y Node.js
echo 4. Marcar como Public
echo 5. NO marcar "Add a README file"
echo 6. Click "Create repository"
echo.
echo OPCION 2 - COMANDOS AUTOMATICOS:
echo Despues de crear el repo en GitHub, ejecuta:
echo.
echo git remote add origin https://github.com/TU-USUARIO/whatsapp-bot-panel.git
echo git branch -M main
echo git push -u origin main
echo.
echo ========================================
echo    DESPLIEGUE EN RENDER
echo ========================================
echo.
echo 1. Ve a: https://render.com
echo 2. Registrate con GitHub
echo 3. New + ^> Web Service
echo 4. Conecta tu repositorio
echo 5. Configuracion automatica (tienes render.yaml)
echo 6. Click "Create Web Service"
echo.
echo Tu bot estara en: https://whatsapp-bot-panel.onrender.com
echo Login: admin / admin123
echo.
pause
