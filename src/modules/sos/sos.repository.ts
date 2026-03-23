import type { AssigmentStatus, SOSStatus } from "../../../generated/prisma";
import { prisma } from "../../prisma";
import type { CreateSOSDTO } from "./sos.type";

export const sosRepository = {
  create(data: CreateSOSDTO) {
    return prisma.sOSRequest.create({ data });
  },

  findById(id: string) {
    return prisma.sOSRequest.findUnique({
        where: {id},
        include: {
            assigment: true,
            vehicle: true,
            user: true,
        }
    });
  },

  updateStatus(id: string, status: SOSStatus) {
    return prisma.sOSRequest.update({
        where: {id},
        data: {status}
    })
  },

  createAssigment(sosRequestId: string, mechanicId: string) {
    return prisma.assigment.create({
        data: {
            sosRequestId,
            mechanicId
        }
    })
  },

  updateAssigment(id: string, status: any) {
    return prisma.assigment.update({
        where: {id},
        data: {status}
    })
  },
};
