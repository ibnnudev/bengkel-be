import { randomUUID } from "node:crypto";
import type { SOSStatus } from "../../../generated/prisma";
import { prisma } from "../../prisma";
import type { CreateSOSDTO } from "./sos.type";
import { NotFoundError } from "../../error/not-found.error";
import { STACKHOLDER } from "../../constants/stackholder";

export const sosRepository = {
  async create(data: CreateSOSDTO) {
    return await prisma.sos_request.create({ data });
  },

  async findById(id: string) {
    const record = await prisma.sos_request.findUnique({
      where: { id },
      include: {
        assignment: true,
        vehicle: true,
        user: true,
      },
    });

    if (!record) throw new NotFoundError(STACKHOLDER.SOS);

    return record;
  },

  async findByIdAndVehicleId(user_id: string, vehicle_id: string) {
    const record = await prisma.sos_request.findFirst({
      where: {
        user_id,
        vehicle_id,
      },
    });

    if (!record) throw new NotFoundError(STACKHOLDER.SOS);

    return record;
  },

  async updateStatus(id: string, status: SOSStatus) {
    return await prisma.sos_request.update({
      where: { id },
      data: { status },
    });
  },

  async createAssignment(sosRequestId: string, mechanicId: string) {
    return await prisma.assignment.create({
      data: {
        id: randomUUID(),
        sos_request_id: sosRequestId,
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
