import { PrismaClient } from '@prisma/client';

// Creamos una instancia única de PrismaClient para reutilizarla en toda la app
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;