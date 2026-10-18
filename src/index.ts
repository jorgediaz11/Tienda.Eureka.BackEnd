import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import prisma from './config/prisma';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
// Seguridad HTTP básica
app.use(helmet()); 

// Permitir peticiones desde el frontend
const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*';
app.use(cors({ origin: corsOrigins }));

// Parsear bodies de tipo JSON
app.use(express.json());

// --- Rutas Básicas de Prueba ---
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 ¡Tienda Eureka Backend API está corriendo!',
    version: 'v1',
    timestamp: new Date().toISOString()
  });
});

// Ruta para verificar conexión a la Base de Datos
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', db: 'Conectada' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', db: 'Desconectada', error: 'No se pudo conectar a la BD' });
  }
});

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Manejo de cierre graceful para Prisma
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});