import { logger } from "../../lib/logger";
import { prisma } from "../../prisma";
import type { CreateUserDTO, UpdateUserDTO } from "./user.type";

export const userRepository = {
  create(data: CreateUserDTO) {
    return prisma.user.create({ data });
  },

  findAvailableMechanics(user_id: string) {
    return prisma.user.findMany({
      where: {
        role: 'MECHANIC',
        is_available: true,
        id: {
          not: user_id,
        }
      }
    })
  },

  findById(id: string) {
    logger.info({ id }, "Finding user by ID");
    return prisma.user.findUnique({ where: { id } });
  },

  findByPhone(phone: string) {
    return prisma.user.findUnique({ where: { phone } });
  },

  update(id: string, data: UpdateUserDTO) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.user.delete({ where: { id } });
  },
};
