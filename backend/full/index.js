import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectToWhatsApp, getAvailableGroups } from './whatsapp.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration for production and development
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, process.env.RAILWAY_STATIC_URL].filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from frontend build in production
if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = join(__dirname, '../../frontend-panel/dist');
  app.use(express.static(frontendDistPath));
}

// Example API endpoint: get dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const usuariosCount = await db('usuarios').count('id as count').first();
    const aportesCount = await db('aportes').count('id as count').first();
    const pedidosCount = await db('pedidos').count('id as count').first();
    const gruposCount = await db('grupos_autorizados').count('id as count').first();

    res.json({
      usuarios: usuariosCount.count,
      aportes: aportesCount.count,
      pedidos: pedidosCount.count,
      grupos: gruposCount.count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bot connection status
app.get('/api/bot/status', async (req, res) => {
  try {
    const { getConnectionStatus } = await import('./whatsapp.js');
    const status = getConnectionStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

import apiRouter from './api.js';
import { router as authRouter } from './auth.js';
import { getQRCode, getQRCodeImage, getConnectionStatus, getSocket } from './whatsapp.js';

// Rutas de autenticación
app.use('/api/auth', authRouter);

// Rutas de API
app.use('/api', apiRouter);

// Endpoints de WhatsApp bajo /api
app.get('/api/whatsapp/qr', (req, res) => {
  const qrImage = getQRCodeImage();
  const status = getConnectionStatus();
  
  if (qrImage) {
    // Extraer solo la parte base64 de la imagen
    const base64Data = qrImage.replace(/^data:image\/png;base64,/, '');
    res.json({ 
      qr: base64Data, 
      qrImage: qrImage,
      status: 'waiting_for_scan' 
    });
  } else {
    res.json({ qr: null, qrImage: null, status });
  }
});

app.get('/api/whatsapp/status', (req, res) => {
  const status = getConnectionStatus();
  res.json({ status });
});

app.post('/api/whatsapp/logout', async (req, res) => {
  try {
    const sock = getSocket();
    if (sock) {
      await sock.logout();
      res.json({ success: true, message: 'Desconectado exitosamente' });
    } else {
      res.json({ success: false, message: 'No hay conexión activa' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener grupos disponibles del bot
app.get('/api/whatsapp/groups', async (req, res) => {
  try {
    const groups = await getAvailableGroups();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint for Railway
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Catch-all handler: send back React's index.html file in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    const frontendDistPath = join(__dirname, '../../frontend-panel/dist');
    res.sendFile(join(frontendDistPath, 'index.html'));
  });
}

// Start the bot connection and server
async function start() {
  await connectToWhatsApp(join(__dirname, 'storage', 'baileys_full'));
  app.listen(port, '0.0.0.0', () => {
    console.log(`Backend server listening on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

start();

export { db, app };
