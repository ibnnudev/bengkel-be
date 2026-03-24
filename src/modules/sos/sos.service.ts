import { randomUUID } from "node:crypto";
import { AssignmentStatus, SOSStatus } from "../../../generated/prisma";
import { BusinessRuleError } from "../../error/business-rule.error";
import { NotFoundError } from "../../error/not-found.error";
import { kafkaProducer } from "../../infrastructure/kafka/kafka";
import { KAFKA_TOPICS } from "../../infrastructure/kafka/topic";
import { tryLockMechanic } from "../../infrastructure/redis/lock-mechanic";
import { logger } from "../../lib/logger";
import { prisma } from "../../prisma";
import { userRepository } from "../user/user.repository";
import { userService } from "../user/user.service";
import { notifySosAssignmentKafka, tryAssignMechanic } from "./sos.helper";
import { sosRepository } from "./sos.repository";
import type {
  AssignMechanicDTO,
  CreateSOSDTO,
  UpdateSOSStatusDTO,
} from "./sos.type";

const MIN_RADIUS_IN_KM = 10;

export const sosService = {
  async createSOS(data: CreateSOSDTO) {
    const user = await userRepository.findById(data.user_id);
    if (!user) throw new Error("User not found");

    const sos = await sosRepository.create(data);
    if (sos.user_id == data.user_id && sos.status !== SOSStatus.DONE) {
      throw new BusinessRuleError("SOS already processed");
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

    const mechanic = await userRepository.findAvailableMechanics(
      data.mechanic_id,
    );
    if (!mechanic) throw new NotFoundError("Mechanic");

    const assignment = await tryAssignMechanic(
      data.sos_request_id,
      data.mechanic_id,
    );

    await notifySosAssignmentKafka(sos);

    return assignment;
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
    if (!sos) throw new NotFoundError("SOS");

    return sos;
  },

  async autoAssign(sosRequestId: string) {
    const sos = await sosRepository.findById(sosRequestId);

    if (!sos) throw new NotFoundError("SOS");

    if (sos.status !== SOSStatus.REQUESTED) {
      throw new BusinessRuleError("SOS already processed");
    }

    const mechanics = await userService.getMechanicNearby(
      sos.latitude,
      sos.longitude,
      MIN_RADIUS_IN_KM,
    );
    if (mechanics.length == 0)
      throw new BusinessRuleError("No mechanics available");

    for (const mechanic of mechanics) {
      const locked = await tryLockMechanic(mechanic.id);
      if (!locked) continue;

      try {
        const result = await prisma.$transaction(async (tx) => {
          const freshMechanic = await tx.user.findUnique({
            where: { id: mechanic.id },
          });

          if (!freshMechanic?.is_available)
            throw new BusinessRuleError("Mechanic already taken");

          await tx.user.update({
            where: { id: mechanic.id },
            data: { is_available: false },
          });

          const assignment = await tx.assignment.create({
            data: {
              id: randomUUID(),
              sos_request_id: sosRequestId,
              mechanic_id: mechanic.id,
              status: AssignmentStatus.PENDING,
            },
          });

          await tx.sos_request.update({
            where: { id: sosRequestId },
            data: { status: SOSStatus.ASSIGNED },
          });

          return assignment;
        });

        await kafkaProducer.send(KAFKA_TOPICS.ASSIGNED, {
          sos_request_id: sosRequestId,
          mechanic_id: mechanic.id,
        });

        return result;
      } catch (error) {
        logger.error({ error, mechanicId: mechanic.id });
        continue;
      }
    }
  },
};
