import { AssignmentStatus, SOSStatus } from "../../../generated/prisma";
import { kafkaProducer } from "../../infrastructure/kafka/kafka";
import { KAFKA_TOPICS } from "../../infrastructure/kafka/topic";
import { prisma } from "../../prisma";
import { userRepository } from "../user/user.repository";
import { userService } from "../user/user.service";
import { sosRepository } from "./sos.repository";
import type {
  AssignMechanicDTO,
  CreateSOSDTO,
  UpdateSOSStatusDTO,
} from "./sos.type";
import { tryLockMechanic } from "../../infrastructure/redis/lock-mechanic";

const MIN_RADIUS_IN_KM = 10;

export const sosService = {
  async createSOS(data: CreateSOSDTO) {
    const user = await userRepository.findById(data.user_id);
    if (!user) throw new Error("User not found");

    const sos = await sosRepository.create(data);
    if(sos.user_id == data.user_id && sos.status !== SOSStatus.REQUESTED) {
      throw new Error("SOS already processed");
    }

    await kafkaProducer.send(KAFKA_TOPICS.CREATED, {
      sosRequestId: sos.id,
      latitude: sos.latitude,
      longitude: sos.longitude,
    });

    return sos;
  },

  async assignMechanic(data: AssignMechanicDTO) {
    const sos = await sosRepository.findById(data.sos_request_id);
    if (!sos) throw new Error("SOS Request not found");

    if (sos.status !== SOSStatus.REQUESTED)
      throw new Error("SOS already assigned or processed");

    const mechanic = await userRepository.findById(data.mechanic_id);
    if (!mechanic || mechanic.role !== "MECHANIC")
      throw new Error("Invalid mechanic");

    if (!mechanic.is_available) throw new Error("Mechanic is not available");

    const assigment = await sosRepository.createAssigment(
      data.sos_request_id,
      data.mechanic_id,
    );

    await sosRepository.updateAssigment(data.sos_request_id, SOSStatus.ASSIGNED);

    await kafkaProducer.send(KAFKA_TOPICS.ASSIGNED, {
      key: sos.id,
      value: JSON.stringify({
        sos_request_id: sos.id,
        latitude: sos.latitude,
        longitude: sos.longitude,
      }),
    });

    return assigment;
  },

  async updateStatus(data: UpdateSOSStatusDTO) {
    const sos = await sosRepository.findById(data.sos_request_id);
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

    return sosRepository.updateStatus(data.sos_request_id, data.status);
  },

  async getSOSDetail(id: string) {
    const sos = await sosRepository.findById(id);
    if (!sos) throw new Error("SOS not found");

    return sos;
  },

  async autoAssign(sosRequestId: string) {
    const sos = await prisma.sos_request.findUnique({
      where: { id: sosRequestId },
    });

    if (!sos) throw new Error("SOS not found");
    if (sos.status !== SOSStatus.REQUESTED) {
      throw new Error("SOS already processed");
    }

    const mechanics = await userService.getMechanicNearby(
      sos.latitude,
      sos.longitude,
      MIN_RADIUS_IN_KM,
    );
    if (mechanics.length == 0) throw new Error("No mechanics available");

    for (const mechanic of mechanics) {
      const locked = await tryLockMechanic(mechanic.id);
      if (!locked) continue;

      try {
        const result = await prisma.$transaction(async (tx) => {
          const freshMechanic = await tx.user.findUnique({
            where: { id: mechanic.id },
          });

          if (!freshMechanic?.is_available)
            throw new Error("Mechanic already taken");

          await tx.user.update({
            where: { id: mechanic.id },
            data: { is_available: false },
          });

          const assigment = await tx.assigment.create({
            data: {
              sos_request_id: sosRequestId,
              mechanic_id: mechanic.id,
              status: AssignmentStatus.PENDING,
            },
          });

          await tx.sos_request.update({
            where: { id: sosRequestId },
            data: { status: SOSStatus.ASSIGNED },
          });

          return assigment;
        });

        await kafkaProducer.send(KAFKA_TOPICS.ASSIGNED, {
          sos_request_id: sosRequestId,
          mechanic_id: mechanic.id,
        });

        return result;
      } catch (error) {
        continue;
      }
    }
  },
};
