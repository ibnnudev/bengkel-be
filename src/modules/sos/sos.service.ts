import { SOSStatus } from "../../../generated/prisma";
import { userRepository } from "../user/user.repository";
import { sosRepository } from "./sos.repository";
import type {
  AssignMechanicDTO,
  CreateSOSDTO,
  UpdateSOSStatusDTO,
} from "./sos.type";

export const sosService = {
  async createSOS(data: CreateSOSDTO) {
    const user = await userRepository.findById(data.userId);
    if (!user) throw new Error("User not found");
    return sosRepository.create(data);
  },

  async assignMechanic(data: AssignMechanicDTO) {
    const sos = await sosRepository.findById(data.sosRequestId);
    if (!sos) throw new Error("SOS Request not found");

    if (sos.status !== SOSStatus.REQUESTED)
      throw new Error("SOS already assigned or processed");

    const mechanic = await userRepository.findById(data.mechanicId);
    if (!mechanic || mechanic.role !== "MECHANIC")
      throw new Error("Invalid mechanic");

    if (!mechanic.isAvailable) throw new Error("Mechanic is not available");

    const assigment = await sosRepository.createAssigment(
      data.sosRequestId,
      data.mechanicId,
    );

    await sosRepository.updateAssigment(data.sosRequestId, SOSStatus.ASSIGNED);

    return assigment;
  },

  async updateStatus(data: UpdateSOSStatusDTO) {
    const sos = await sosRepository.findById(data.sosRequestId);
    if (!sos) throw new Error("SOS Request not found");

    const validTransitions: Record<SOSStatus, SOSStatus[]> = {
      REQUESTED: [SOSStatus.ASSIGNED, SOSStatus.CANCELED],
      ASSIGNED: [SOSStatus.ON_PROGRESS, SOSStatus.CANCELED],
      ON_PROGRESS: [SOSStatus.DONE],
      DONE: [],
      CANCELED: [],
    };

    const allowed = validTransitions[sos.status];
    if (!allowed.includes(data.status)) {
      throw new Error(
        `Invalid status transition from ${sos.status} to ${data.status}`,
      );
    }

    return sosRepository.updateStatus(data.sosRequestId, data.status);
  },

  async getSOSDetail(id: string) {
    const sos = await sosRepository.findById(id);
    if(!sos) throw new Error("SOS not found");

    return sos;
  }
};
