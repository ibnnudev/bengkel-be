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
            assigment: true,
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

  createAssigment(sosRequestId: string, mechanicId: string) {
    return prisma.assigment.create({
        data: {
            sos_request_id: sosRequestId,
            mechanic_id: mechanicId,
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
