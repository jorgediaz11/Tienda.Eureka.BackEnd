import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Declaración mínima de 'process' para evitar dependencia de @types/node
declare const process: {
  exit(code?: number): never;
};

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // 1. Limpiar tablas existentes (en orden para evitar errores de foreign key)
  console.log('🧹 Limpiando tablas existentes...');
  await prisma.contactMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.supportTopic.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.guideGroupProduct.deleteMany();
  await prisma.guideGroup.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 2. Crear usuario de prueba
  console.log('👤 Creando usuario de prueba...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  await prisma.user.create({
    data: {
      email: 'usuario@eureka.pe',
      passwordHash: hashedPassword,
      fullName: 'Usuario de Prueba',
      phone: '999999999',
      isActive: true,
    },
  });

  // 3. Crear productos (IDs tipo libro-0011 para compatibilidad con frontend)
  console.log('📚 Creando productos...');
  const products = [
    { id: 'libro-0011', title: 'Cien Años de Soledad', description: 'Gabriel García Márquez', price: 24.99, imageUrl: '/src/assets/images/libro-0011.png' },
    { id: 'libro-0006', title: 'El Principito', description: 'Antoine de Saint-Exupéry', price: 18.99, imageUrl: '/src/assets/images/libro-0006.png' },
    { id: 'libro-0010', title: 'Don Quijote de la Mancha', description: 'Miguel de Cervantes', price: 32.99, imageUrl: '/src/assets/images/libro-0010.png' },
    { id: 'libro-0001', title: 'Crónica de una Muerte Anunciada', description: 'Gabriel García Márquez', price: 21.99, imageUrl: '/src/assets/images/libro-0001.png' },
    { id: 'libro-0013', title: 'Romeo y Julieta', description: 'William Shakespeare', price: 19.99, imageUrl: '/src/assets/images/libro-0013.png' },
    { id: 'libro-0007', title: 'La Odisea', description: 'Homero', price: 23.99, imageUrl: '/src/assets/images/libro-0007.png' },
    { id: 'libro-0009', title: 'El Principito Edición Especial', description: 'Antoine de Saint-Exupéry', price: 18.99, imageUrl: '/src/assets/images/libro-0009.png' },
    { id: 'libro-0004', title: 'La Casa de Bernarda Alba', description: 'Federico García Lorca', price: 22.99, imageUrl: '/src/assets/images/libro-0004.png' },
    { id: 'libro-0002', title: 'El Lazarillo de Tormes', description: 'Anónimo', price: 16.99, imageUrl: '/src/assets/images/libro-0002.png' },
    { id: 'libro-0014', title: 'Mitos y Leyendas del Perú', description: 'Ricardo Palma', price: 26.99, imageUrl: '/src/assets/images/libro-0014.png' },
    { id: 'libro-0005', title: 'La Metamorfosis', description: 'Franz Kafka', price: 17.99, imageUrl: '/src/assets/images/libro-0005.png' },
    { id: 'libro-0003', title: 'La Metamorfosis Edición Especial', description: 'Franz Kafka', price: 17.99, imageUrl: '/src/assets/images/libro-0003.png' },
    { id: 'libro-0008', title: 'Crónica de una Muerte Anunciada Edición Especial', description: 'Gabriel García Márquez', price: 21.99, imageUrl: '/src/assets/images/libro-0008.png' },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        currency: 'PEN',
        isActive: true,
      },
    });
  }

  // 4. Crear cupones
  console.log('🎟️ Creando cupones...');
  await prisma.coupon.createMany({
    data: [
      {
        code: 'EUREKA10',
        type: 'percentage',
        value: 10,
        startsAt: new Date('2026-01-01'),
        endsAt: new Date('2026-12-31'),
        maxUses: 1000,
        usedCount: 0,
        isActive: true,
      },
      {
        code: 'LECTOR5',
        type: 'fixed',
        value: 5,
        startsAt: new Date('2026-01-01'),
        endsAt: new Date('2026-12-31'),
        maxUses: 500,
        usedCount: 0,
        isActive: true,
      },
    ],
  });

  // 5. Crear guías de compra + relación con productos
  console.log(' Creando guías de compra...');
  const guideGroups = [
    {
      key: 'plan-lector',
      title: 'Plan Lector',
      description: 'Libros seleccionados por grado y plan curricular.',
      sortOrder: 1,
      productIds: ['libro-0011', 'libro-0006', 'libro-0010'],
    },
    {
      key: 'refuerzo',
      title: 'Refuerzo Académico',
      description: 'Textos de práctica para matemática, comunicación y ciencias.',
      sortOrder: 2,
      productIds: ['libro-0004', 'libro-0002', 'libro-0005'],
    },
    {
      key: 'cultura',
      title: 'Cultura General',
      description: 'Lecturas complementarias para proyectos y exposiciones.',
      sortOrder: 3,
      productIds: ['libro-0014', 'libro-0013', 'libro-0007'],
    },
  ];

  for (const group of guideGroups) {
    const createdGroup = await prisma.guideGroup.create({
      data: {
        key: group.key,
        title: group.title,
        description: group.description,
        sortOrder: group.sortOrder,
        isActive: true,
      },
    });

    for (const productId of group.productIds) {
      await prisma.guideGroupProduct.create({
        data: {
          guideGroupId: createdGroup.id,
          productId: productId,
        },
      });
    }
  }

  // 6. Crear temas de soporte
  console.log(' Creando temas de soporte...');
  await prisma.supportTopic.createMany({
    data: [
      {
        id: 'order-status',
        title: 'Estado de Pedido',
        description: 'Consulta el estado de tu pedido',
        channel: 'Pedidos',
        isActive: true,
      },
      {
        id: 'returns',
        title: 'Devoluciones',
        description: 'Proceso de devolución de productos',
        channel: 'Pedidos',
        isActive: true,
      },
      {
        id: 'payment-issues',
        title: 'Problemas de Pago',
        description: 'Ayuda con pagos rechazados o pendientes',
        channel: 'Pagos',
        isActive: true,
      },
      {
        id: 'product-info',
        title: 'Información de Productos',
        description: 'Consultas sobre disponibilidad y características',
        channel: 'Catálogo',
        isActive: true,
      },
    ],
  });

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });