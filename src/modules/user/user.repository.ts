import { STACKHOLDER } from "../../constants/stackholder";
import { NotFoundError } from "../../error/not-found.error";
import { logger } from "../../lib/logger";
import { prisma } from "../../prisma";
import type { CreateUserDTO, UpdateUserDTO } from "./user.type";

export const userRepository = {
  create(data: CreateUserDTO) {
      return prisma.user.create({ data }).catch((error: Error) => {
        logger.error({ error, data }, "Error creating user");
        throw error;
      });
  },

  async findAvailableMechanics(user_id: string) {
      return await prisma.user.findMany({
        where: {
          role: 'MECHANIC',
          is_available: true,
          id: {
            not: user_id,
          }
        }
      }).catch((error: Error) => {
        if(error instanceof NotFoundError) throw new NotFoundError(STACKHOLDER.MECHANIC);
        throw error;
      });
  },

  async findById(id: string) {
      return await prisma.user.findUniqueOrThrow({ where: { id } }).catch((error: Error) => {
        if(error instanceof NotFoundError) throw new NotFoundError(STACKHOLDER.USER);
        throw error;
      });
  },

  async findByPhone(phone: string) {
      return await prisma.user.findUniqueOrThrow({ where: { phone } }).catch((error: Error) => {
        if(error instanceof NotFoundError) throw new NotFoundError(STACKHOLDER.USER);
        throw error;
      });
  },

  async update(id: string, data: UpdateUserDTO) {
      return await prisma.user.update({
        where: { id },
        data,
      }).catch((error: Error) => {
        if(error instanceof NotFoundError) throw new NotFoundError(STACKHOLDER.USER);
        throw error;
      });
  },

  async delete(id: string) {
      return await prisma.user.delete({ where: { id } }).catch((error: Error) => {
        if(error instanceof NotFoundError) throw new NotFoundError(STACKHOLDER.USER);
        throw error;
      });
  },
};
