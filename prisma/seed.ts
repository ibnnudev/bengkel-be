import "dotenv/config";

import { logger } from "../src/lib/logger";
import { prisma } from "../src/infrastructure/database/prisma-client";
import { Role, OrderType, OrderStatus, PaymentStatus } from "../generated/prisma";

const main = async () => {
  logger.info("🌱 Seeding...");

  const customer = await prisma.user.create({
    data: {
      name: "Ibnu Customer",
      phone: "081234567890",
      role: Role.CUSTOMER,
    },
  });

  const vehicle = await prisma.vehicle.create({
    data: {
      user_id: customer.id,
      brand: "Toyota",
      model: "Avanza",
      plate_number: "B 1234 CD",
    },
  });

  const mechanics = await prisma.user.createMany({
    data: [
      {
        name: "Mechanic A",
        phone: "0811111111",
        role: Role.MECHANIC,
        latitude: -6.2,
        longitude: 106.816,
        is_available: true,
      },
      {
        name: "Mechanic B",
        phone: "0822222222",
        role: Role.MECHANIC,
        latitude: -6.21,
        longitude: 106.82,
        is_available: true,
      },
      {
        name: "Mechanic C",
        phone: "0833333333",
        role: Role.MECHANIC,
        latitude: -6.25,
        longitude: 106.9,
        is_available: true,
      },
    ],
  });

  const mechanic = await prisma.user.findFirst({
    where: { role: Role.MECHANIC },
  });

  const order = await prisma.order.create({
    data: {
      user_id: customer.id,
      vehicle_id: vehicle.id,
      schedule_at: new Date(),
      status: OrderStatus.REQUESTED,
      latitude: -6.2,
      longitude: 106.816,
    },
  });

  const assignment = await prisma.assignment.create({
    data: {
      order_id: order.id,
      mechanic_id: mechanic!.id,
      status: "ACCEPTED",
    },
  });

  const serviceLog = await prisma.service_log.create({
    data: {
      order_id: order.id,
      mechanic_id: mechanic!.id,
      notes: "Ganti oli dan cek mesin",
    },
  });

  const sparepart = await prisma.sparepart.create({
    data: {
      name: "Oli Mesin",
      stock: 100,
      price: 100000,
    },
  });

  await prisma.service_item.create({
    data: {
      service_log_id: serviceLog.id,
      sparepart_id: sparepart.id,
      name: "Oli Mesin",
      qty: 1,
      price: 100000,
    },
  });

  const invoice = await prisma.invoice.create({
    data: {
      order_id: order.id,
      total: 100000,
      status: PaymentStatus.UNPAID,
    },
  });

  logger.info(
    {
      orderId: order.id,
      assignmentId: assignment.id,
      invoiceId: invoice.id,
    },
    "🚀 Dummy order created"
  );

  logger.info("✅ Seeding completed");
};

main()
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });