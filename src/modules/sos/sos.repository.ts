import { randomUUID } from "node:crypto";
import type { SOSStatus } from "../../../generated/prisma";
import { prisma } from "../../prisma";
import type { CreateSOSDTO } from "./sos.type";

export const sosRepository = {
  create(data: CreateSOSDTO) {
    return prisma.sos_request.create({ data });
  },

  findById(id: string) {
    return prisma.sos_request.findUnique({
        where: {id},
        include: {
            assignment: true,
            vehicle: true,
            user: true,
        }
    });
  },

  updateStatus(id: string, status: SOSStatus) {
    return prisma.sos_request.update({
        where: {id},
        data: {status}
    })
  },

  createAssignment(sosRequestId: string, mechanicId: string) {
    return prisma.assignment.create({
        data: {
            id: randomUUID(),
            sos_request_id: sosRequestId,
            mechanic_id: mechanicId,
        }
    })
  },

  updateAssignment(id: string, status: any) {
    return prisma.assignment.update({
        where: {id},
        data: {status}
    })
  },
};
