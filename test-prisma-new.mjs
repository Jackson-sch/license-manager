import { PrismaClient } from './prisma/generated-client/index.js';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Intentando conectar con Prisma...');
    const result = await prisma.$connect();
    console.log('Conexión exitosa.');

    const count = await prisma.licencia.count();
    console.log('Total licencias:', count);
  } catch (error) {
    console.error('Error en Prisma:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
