import { randomUUID } from "node:crypto";
import type { OrderStatus } from "../../../generated/prisma";
import { prisma } from "../../prisma";
import type { CreateOrderDTO } from "./order.type";
import { NotFoundError } from "../../error/not-found.error";
import { STACKHOLDER } from "../../constants/stackholder";

export const orderRepository = {
  async create(data: CreateOrderDTO) {
    return await prisma.order.create({ data });
  },

  async findById(id: string) {
    const record = await prisma.order.findUnique({
      where: { id },
      include: {
        assignment: true,
        vehicle: true,
        user: true,
        invoices: true
      },
    });

    if (!record) throw new NotFoundError(STACKHOLDER.SOS);

    return record;
  },

  async findByIdAndVehicleId(user_id: string, vehicle_id: string) {
    const record = await prisma.order.findFirst({
      where: {
        user_id,
        vehicle_id,
      },
    });

    if (!record) throw new NotFoundError(STACKHOLDER.SOS);

    return record;
  },

  async updateStatus(id: string, status: OrderStatus) {
    return await prisma.order.update({
      where: { id },
      data: { status },
    });
  },

  async createAssignment(orderId: string, mechanicId: string) {
    return await prisma.assignment.create({
      data: {
        id: randomUUID(),
        order_id: orderId,
        mechanic_id: mechanicId,
      },
    });
  },

  async updateAssignment(id: string, status: any) {
    return await prisma.assignment.update({
      where: { id },
      data: { status },
    });
  },
};
