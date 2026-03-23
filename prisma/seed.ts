import "dotenv/config";

import { logger } from "../src/lib/logger";
import { prisma } from "../src/infrastructure/database/prisma-client";
import { Role } from "../generated/prisma";

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

  await prisma.user.createMany({
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

  logger.info("✅ Seeding completed");

  const sos = await prisma.sos_request.create({
    data: {
        user_id: customer.id,
        vehicle_id: vehicle.id,
        latitude: -6.2,
        longitude: 106.816
    }
  })

  logger.info({ sosId: sos.id}, "🚨 Dummy SOS created");
  logger.info("🌱 Seeding done.");
};

main()
.catch((e) => {
    logger.error(e);
    process.exit(1);
})
.finally(async () => {
    await prisma.$disconnect();
});
