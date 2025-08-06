# 🚀 Guía Completa de Railway CLI - WhatsApp Bot Panel

## 📋 Comandos Esenciales de Railway CLI

### 1. 🔐 Autenticación
```bash
# Iniciar sesión en Railway
railway login

# Verificar autenticación
railway whoami
```

### 2. 🚀 Inicialización del Proyecto
```bash
# Inicializar proyecto Railway en directorio actual
railway init

# Conectar a proyecto existente
railway link [PROJECT_ID]

# Ver información del proyecto
railway status
```

### 3. ⚙️ Variables de Entorno
```bash
# Ver todas las variables
railway variables

# Agregar variable de entorno
railway variables set VARIABLE_NAME=value

# Variables necesarias para tu bot:
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set FRONTEND_URL=https://tu-app.railway.app
railway variables set RAILWAY_STATIC_URL=https://tu-app.railway.app
railway variables set JWT_SECRET=tu_jwt_secret_aqui
railway variables set ADMIN_PASSWORD=tu_password_admin
```

### 4. 📦 Despliegue
```bash
# Desplegar proyecto
railway up

# Desplegar con logs en vivo
railway up --detach

# Forzar redespliegue
railway redeploy
```

### 5. 📊 Monitoreo y Logs
```bash
# Ver logs en tiempo real
railway logs

# Ver logs con filtro
railway logs --tail 100

# Ver logs de un servicio específico
railway logs --service [SERVICE_NAME]
```

### 6. 🌐 Dominios y URLs
```bash
# Ver dominio asignado
railway domain

# Abrir aplicación en navegador
railway open

# Ver información de la URL
railway status
```

### 7. 🔧 Gestión de Servicios
```bash
# Listar servicios
railway service

# Conectar a base de datos (si existe)
railway connect

# Ver métricas
railway metrics
```

### 8. 📁 Gestión de Archivos
```bash
# Ver archivos del proyecto
railway shell

# Ejecutar comandos en el contenedor
railway run [COMMAND]
```

## 🎯 Flujo de Trabajo Recomendado

### Primer Despliegue:
1. `railway login`
2. `railway init`
3. Configurar variables de entorno
4. `railway up`
5. `railway open` para verificar

### Actualizaciones:
1. Hacer cambios en el código
2. `git add . && git commit -m "mensaje"`
3. `git push` (si está conectado a GitHub)
4. O usar `railway up` para despliegue directo

### Monitoreo:
1. `railway logs` para ver actividad
2. `railway status` para estado general
3. `railway metrics` para rendimiento

## 🔧 Variables de Entorno Específicas para tu Bot

```bash
# Variables obligatorias
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set JWT_SECRET=$(openssl rand -base64 32)

# URLs del frontend
railway variables set FRONTEND_URL=https://tu-app.railway.app
railway variables set RAILWAY_STATIC_URL=https://tu-app.railway.app

# Configuración del bot
railway variables set ADMIN_PASSWORD=tu_password_seguro
railway variables set BOT_NAME="Mi Bot WhatsApp"

# Base de datos (SQLite se maneja automáticamente)
railway variables set DATABASE_PATH=/app/backend/full/storage/database.sqlite
```

## 🚨 Comandos de Emergencia

```bash
# Reiniciar aplicación
railway restart

# Ver estado de salud
railway status

# Acceder al shell del contenedor
railway shell

# Ver variables actuales
railway variables

# Eliminar variable
railway variables unset VARIABLE_NAME
```

## 📝 Notas Importantes

1. **Tu proyecto ya está configurado** con `railway.json`
2. **El build se ejecuta automáticamente** con `npm run railway:build`
3. **El servidor inicia** con `npm run start:production`
4. **Los logs se guardan** en `backend/full/logs/`
5. **La base de datos SQLite** se mantiene en `backend/full/storage/`

## 🔍 Troubleshooting

```bash
# Si hay problemas de build
railway logs --tail 50

# Si la app no responde
railway restart

# Si hay problemas de variables
railway variables

# Para debugging
railway shell
cd /app && ls -la
```

## 🎉 ¡Tu Bot Está Listo!

Una vez desplegado, tu bot estará disponible en:
- **Panel Web**: `https://tu-app.railway.app`
- **API**: `https://tu-app.railway.app/api/`
- **Health Check**: `https://tu-app.railway.app/api/health`
