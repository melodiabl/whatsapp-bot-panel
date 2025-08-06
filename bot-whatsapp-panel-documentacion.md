# 📱 Sistema de Bot WhatsApp + Panel de Control

## Descripción General
Sistema completo de gestión de contenido de manhwas vía WhatsApp con panel web administrativo. El bot registra aportes y pedidos en tiempo real, y el panel permite gestionarlos con autenticación por roles.

## 🎯 Arquitectura del Sistema

### 1. Bot de WhatsApp (Baileys)
- **Tecnología**: Node.js + Baileys (MultiFileAuth)
- **Base de datos**: SQLite (datos reales, sin simulación)
- **Comunicación**: Comandos de texto `/comando`

### 2. Panel Web
- **Frontend**: React + Vite + Chakra UI
- **Autenticación**: Roles (creadora, admin, user)
- **Conexión**: Directa a base de datos SQLite

## 📊 Base de Datos (SQLite)

### Estructura de Tablas

```sql
-- Usuarios del sistema
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol TEXT CHECK(rol IN ('creadora', 'admin', 'user')) NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Aportes de contenido
CREATE TABLE aportes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contenido TEXT NOT NULL,
    tipo TEXT CHECK(tipo IN ('texto', 'imagen', 'pdf', 'link')) NOT NULL,
    titulo TEXT,
    usuario TEXT NOT NULL,
    grupo TEXT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    origen TEXT CHECK(origen IN ('manual', 'proveedor')) DEFAULT 'manual',
    pdf_generado TEXT,
    es_extra BOOLEAN DEFAULT FALSE
);

-- Pedidos de usuarios
CREATE TABLE pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    texto TEXT NOT NULL,
    usuario TEXT NOT NULL,
    grupo TEXT NOT NULL,
    estado TEXT CHECK(estado IN ('pendiente', 'resuelto')) DEFAULT 'pendiente',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Logs de actividad
CREATE TABLE logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    usuario TEXT,
    grupo TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Grupos autorizados
CREATE TABLE grupos_autorizados (
    jid TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo TEXT CHECK(tipo IN ('normal', 'proveedor')) DEFAULT 'normal',
    fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Configuración del bot
CREATE TABLE configuracion (
    clave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Usuarios baneados
CREATE TABLE baneados (
    usuario TEXT PRIMARY KEY,
    motivo TEXT,
    fecha_baneo DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Advertencias
CREATE TABLE advertencias (
    usuario TEXT PRIMARY KEY,
    contador INTEGER DEFAULT 0,
    fecha_ultima DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ilustraciones
CREATE TABLE ilustraciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    imagen_url TEXT NOT NULL,
    usuario TEXT NOT NULL,
    grupo TEXT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🤖 Comandos del Bot

### Comandos de Usuario
| Comando | Descripción |
|---------|-------------|
| `/menu` | Muestra menú de ayuda completo |
| `/pedido <texto>` | Crea un nuevo pedido de contenido |
| `/mispedidos` | Lista todos los pedidos del usuario |
| `/aportar <título>` | Sube contenido al sistema |
| `/misaportes` | Muestra aportes propios |
| `/aportes` | Lista aportes públicos |
| `/manhwas` | Lista manhwas disponibles |
| `/ia <pregunta>` | Consulta con inteligencia artificial |

### Comandos de Administrador
| Comando | Descripción |
|---------|-------------|
| `/tagall` | Menciona a todos los miembros del grupo |
| `/ban <usuario>` | Banea a un usuario del bot |
| `/unban <usuario>` | Desbanea a un usuario |
| `/addgroup` | Autoriza el grupo actual para usar el bot |
| `/setloggroup` | Define grupo para logs del bot |
| `/toggleprivado` | Activa/desactiva modo privado |
| `/toggleamigos` | Activa/desactiva modo amigos |
| `/togglewarnings` | Activa/desactiva advertencias automáticas |
| `/addproveedor` | Marca grupo como proveedor automático |

## 🖥️ Panel de Control

### Estructura de Carpetas
```
frontend-panel/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   ├── StatsCard.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Aportes.jsx
│   │   ├── Manhwas.jsx
│   │   ├── Ilustraciones.jsx
│   │   ├── Pedidos.jsx
│   │   ├── Grupos.jsx
│   │   ├── Logs.jsx
│   │   └── Configuracion.jsx
│   ├── utils/
│   │   └── roles.js
│   ├── App.jsx
│   └── main.jsx
```

### Roles y Permisos
- **creadora**: Acceso completo a todas las funciones
- **admin**: Acceso a gestión de contenido y usuarios
- **user**: Acceso solo a sus propios datos

### Secciones del Panel
1. **Dashboard**: Estadísticas generales en tiempo real
2. **Aportes**: Gestión completa de aportes con filtros
3. **Manhwas**: Administración de títulos y capítulos
4. **Ilustraciones**: Galería de imágenes compartidas
5. **Pedidos**: Lista de pedidos con gestión de estados
6. **Grupos**: Administración de grupos autorizados
7. **Logs**: Historial completo de actividad
8. **Configuración**: Ajustes globales (solo creadora)

## 🔧 Configuración Inicial

### Backend (Node.js)
```bash
cd backend/full
npm install
npm start
```

### Frontend (React)
```bash
cd frontend-panel
npm install
npm run dev
```

### Base de Datos
El sistema creará automáticamente la base de datos SQLite en:
```
backend/full/database.db
```

## 📋 Flujos de Trabajo

### 1. Subida de Aporte
1. Usuario envía `/aportar <título>` en grupo autorizado
2. Bot guarda contenido en base de datos
3. Panel actualiza automáticamente con nuevo aporte

### 2. Gestión de Pedidos
1. Usuario envía `/pedido <texto>`
2. Bot registra pedido como "pendiente"
3. Admin marca como "resuelto" desde panel

### 3. Grupos Proveedores
1. Admin ejecuta `/addproveedor` en grupo
2. Todo contenido enviado se guarda automáticamente
3. Panel muestra origen como "proveedor"

## 🚨 Notas Importantes
- **NO SIMULAR DATOS**: Todo debe conectarse a base de datos real
- El bot y el panel comparten la misma base de datos SQLite
- Los cambios en el bot se reflejan inmediatamente en el panel
- Toda la información es persistente y real
