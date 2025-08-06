# Despliegue en Railway - WhatsApp Bot Panel

Este documento explica cómo desplegar el panel de control del bot de WhatsApp en Railway.

## 📋 Requisitos Previos

1. Cuenta en [Railway](https://railway.app)
2. Repositorio Git con el código del proyecto
3. Railway CLI (opcional, pero recomendado)

## 🚀 Pasos para el Despliegue

### 1. Preparar el Repositorio

Asegúrate de que tu repositorio contenga todos los archivos necesarios:
- `package.json` (configurado para producción)
- `Dockerfile`
- `railway.json`
- `.dockerignore`
- `.env.example`

### 2. Crear Proyecto en Railway

#### Opción A: Desde la Web
1. Ve a [Railway](https://railway.app) e inicia sesión
2. Haz clic en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu repositorio

#### Opción B: Desde CLI
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Iniciar sesión
railway login

# Crear proyecto
railway init

# Desplegar
railway up
```

### 3. Configurar Variables de Entorno

En el dashboard de Railway, ve a la sección "Variables" y configura:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=tu-clave-jwt-super-secreta-aqui
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu-password-seguro-aqui
BOT_NAME=WhatsApp Bot Panel
BOT_VERSION=2.5
```

### 4. Configurar Dominio (Opcional)

1. En el dashboard de Railway, ve a "Settings"
2. En la sección "Domains", puedes:
   - Usar el dominio generado automáticamente: `tu-app.railway.app`
   - Configurar un dominio personalizado

### 5. Verificar el Despliegue

1. Una vez desplegado, visita tu URL
2. Deberías ver la página de login del panel
3. Usa las credenciales configuradas en las variables de entorno

## 🔧 Configuración Post-Despliegue

### Primer Acceso
1. Accede con las credenciales de admin configuradas
2. Ve a la sección "WhatsApp QR" para conectar tu bot
3. Escanea el código QR con WhatsApp Web
4. Configura los grupos autorizados en la sección "Grupos"

### Configuración de Grupos
1. Ve a "Grupos" en el panel
2. Haz clic en "Autorizar Grupo"
3. Selecciona los grupos donde el bot está presente
4. Configura los permisos y restricciones

## 📊 Monitoreo

Railway proporciona:
- Logs en tiempo real
- Métricas de uso
- Health checks automáticos
- Reinicio automático en caso de fallos

## 🔒 Seguridad

### Variables de Entorno Importantes
- `JWT_SECRET`: Cambia por una clave segura y única
- `ADMIN_PASSWORD`: Usa una contraseña fuerte
- `NODE_ENV`: Debe estar en "production"

### Recomendaciones
1. Cambia las credenciales por defecto inmediatamente
2. Usa contraseñas fuertes
3. Revisa los logs regularmente
4. Mantén el código actualizado

## 🐛 Solución de Problemas

### El bot no se conecta
1. Verifica que las variables de entorno estén configuradas
2. Revisa los logs en Railway
3. Asegúrate de que el puerto 3001 esté disponible

### Error de CORS
1. Verifica que `FRONTEND_URL` esté configurada correctamente
2. Asegúrate de que coincida con tu dominio de Railway

### Base de datos no inicializa
1. Los logs mostrarán errores de SQLite
2. Verifica que el directorio `storage` tenga permisos de escritura
3. Railway maneja esto automáticamente, pero revisa los logs

## 📝 Comandos Útiles

```bash
# Ver logs
railway logs

# Conectar a la base de datos (si usas PostgreSQL)
railway connect

# Redeploy
railway up

# Ver variables de entorno
railway variables

# Abrir en el navegador
railway open
```

## 🔄 Actualizaciones

Para actualizar el proyecto:
1. Haz push a tu repositorio
2. Railway detectará los cambios automáticamente
3. Se iniciará un nuevo despliegue

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Railway
2. Verifica la configuración de variables de entorno
3. Consulta la documentación de Railway
4. Revisa los issues del repositorio

---

¡Tu panel de WhatsApp Bot está listo para usar en Railway! 🎉
