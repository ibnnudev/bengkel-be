import { Role, type User } from "../../../generated/prisma";
import { calculateDistance } from "../../helper/calculate-distance.helper";
import { prisma } from "../../prisma";
import { userRepository } from "./user.repository";
import type { CreateUserDTO, UpdateUserDTO } from "./user.type";

export const userService = {
  async createUser(data: CreateUserDTO) {
    const existing = await userRepository.findByPhone(data.phone);
    if (existing) {
        throw new Error("Phone already registered");
    }

    return userRepository.create({
        ...data,
        role: data.role ?? Role.CUSTOMER,
    });
  },

  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if(!user) {
      throw new Error("User not found");
    }
    return user;
  },

  async updateUser(id: string, data: UpdateUserDTO) {
    await this.getUserById(id);
    return userRepository.update(id, data);
  },

  async deleteUser(id: string) {
    await this.getUserById(id);
    return userRepository.delete(id);
  },

  async getMechanicNearby(lat: number, lng: number, radiusKm = 5) {
    const mechanics = await prisma.user.findMany({
      where: {role: Role.MECHANIC, isAvailable: true}
    })
    return mechanics.filter((mechanic: User) => {
      if(!mechanic.latitude || !mechanic.longitude) return false;
      const distance = calculateDistance({
        lat1: lat,
        lon1: lng,
        lat2: mechanic.latitude,
        lon2: mechanic.longitude
      });

      return distance <= radiusKm
    })
  }
};
