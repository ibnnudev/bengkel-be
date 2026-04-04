import { logger } from "../../lib/logger";
import { prisma } from "../../prisma";
import type { CreateUserDTO, UpdateUserDTO } from "./user.type";

export const userRepository = {
  create(data: CreateUserDTO) {
    try {
      logger.info({ data }, "Creating user");
      return prisma.user.create({ data });
    } catch (error) {
      logger.error({ data, error }, "Error creating user");
      throw error;
    }
  },

  findAvailableMechanics(user_id: string) {
    try {
      logger.info({ user_id }, "Finding available mechanics");
      return prisma.user.findMany({
        where: {
          role: 'MECHANIC',
          is_available: true,
          id: {
            not: user_id,
          }
        }
      });
    } catch (error) {
      logger.error({ user_id, error }, "Error finding available mechanics");
      throw error;
    }
  },

  findById(id: string) {
    try {
      logger.info({ id }, "Finding user by ID");
      return prisma.user.findUnique({ where: { id } });
    } catch (error) {
      logger.error({ id, error }, "Error finding user by ID");
      throw error;
    }
  },

  findByPhone(phone: string) {
    try {
      logger.info({ phone }, "Finding user by phone");
      return prisma.user.findUnique({ where: { phone } });
    } catch (error) {
      logger.error({ phone, error }, "Error finding user by phone");
      throw error;
    }
  },

  update(id: string, data: UpdateUserDTO) {
    try {
      logger.info({ id }, "Updating user");
      return prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      logger.error({ id, error }, "Error updating user");
      throw error;
    }
  },

  delete(id: string) {
    try {
      logger.info({ id }, "Deleting user");
      return prisma.user.delete({ where: { id } });
    } catch (error) {
      logger.error({ id, error }, "Error deleting user");
      throw error;
    }
  },
};
