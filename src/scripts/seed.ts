import { PrismaClient, RoleType, PaymentMethod, OrderStatus, ApprovisionnementStatus, DeliveryStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // --- Clean up existing data ---
  console.log('Deleting existing data...');
  await prisma.orderItem.deleteMany({});
  await prisma.delivery.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.stock.deleteMany({});
  await prisma.approvisionnement.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.warehouse.deleteMany({});
  await prisma.userRole.deleteMany({}); // Clear junction table first
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});

  // --- Create Roles ---
  console.log('Creating roles...');
  const roleData = Object.values(RoleType).map(type => ({ 
    name: type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, ' '),
    type: type 
  }));
  await prisma.role.createMany({ data: roleData });
  const roles = await prisma.role.findMany();
  const roleMap = new Map(roles.map(role => [role.type, role.id]));

  // --- Create Users and Assign Roles ---
  console.log('Creating users and assigning roles...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const usersToCreate = [
    { username: 'admin', email: 'admin@arizon.com', roleType: RoleType.ADMIN },
    { username: 'business', email: 'business@arizon.com', roleType: RoleType.BUSINESS },
    { username: 'supplier', email: 'supplier@arizon.com', roleType: RoleType.SUPPLIER },
    { username: 'stock_manager', email: 'stock@arizon.com', roleType: RoleType.STOCK_MANAGER },
    { username: 'client', email: 'client@arizon.com', roleType: RoleType.CLIENT },
    { username: 'command_manager', email: 'command@arizon.com', roleType: RoleType.COMMAND_MANAGER },
    { username: 'delivery_driver', email: 'driver@arizon.com', roleType: RoleType.DELIVERY_DRIVER },
  ];

  for (const userData of usersToCreate) {
    const user = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
      }
    });
    const roleId = roleMap.get(userData.roleType);
    if (roleId) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: roleId,
        }
      });
    } else {
      console.warn(`Role type ${userData.roleType} not found in roleMap.`);
    }
  }

  const clientUser = await prisma.user.findUnique({ where: { email: 'client@arizon.com' } });
  const supplierUser = await prisma.user.findUnique({ where: { email: 'supplier@arizon.com' } });
  const driverUser = await prisma.user.findUnique({ where: { email: 'driver@arizon.com' } });

  if (!clientUser || !supplierUser || !driverUser) {
    throw new Error('Failed to create critical seed users for business logic.');
  }

  /*
  // --- Create Warehouses ---
  console.log('Creating warehouses...');
  const warehouse1 = await prisma.warehouse.create({ data: { name: 'Central Warehouse', address: faker.location.streetAddress(true) } });

  // --- Create Product Categories ---
  console.log('Creating product categories...');
  const category1 = await prisma.productCategory.create({ data: { name: 'Electronics' } });

  // --- Create Products ---
  console.log('Creating products...');
  const product1 = await prisma.product.create({ data: { name: 'Gaming Laptop', description: faker.commerce.productDescription(), unit: 'piece', categoryId: category1.id } });

  // --- Create Stock ---
  console.log('Creating stock...');
  await prisma.stock.create({ data: { productId: product1.id, warehouseId: warehouse1.id, quantity: 150, unitPrice: 1499.99 } });

  // --- Create Approvisionnements ---
  console.log('Creating approvisionnements...');
  await prisma.approvisionnement.create({
    data: {
      productId: product1.id,
      warehouseId: warehouse1.id,
      supplierId: supplierUser.id,
      quantity: 50,
      proposedPrice: 1200.00,
      status: ApprovisionnementStatus.PENDING,
      deliveryDate: faker.date.future(),
    }
  });

  // --- Create Orders ---
  console.log('Creating orders...');
  const order1 = await prisma.order.create({
    data: {
      clientId: clientUser.id,
      warehouseId: warehouse1.id,
      totalAmount: 2999.98,
      status: OrderStatus.SHIPPED,
      paymentMethod: PaymentMethod.CARD,
      orderItems: {
        create: [{ productId: product1.id, quantity: 2, unitPrice: 1499.99 }]
      }
    }
  });

  // --- Create Deliveries ---
  console.log('Creating deliveries...');
  await prisma.delivery.create({
    data: {
      orderId: order1.id,
      driverId: driverUser.id,
      status: DeliveryStatus.IN_TRANSIT,
      deliveryDate: faker.date.future(),
    }
  });*/

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('An error occurred during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
