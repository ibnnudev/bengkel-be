import { randomUUID } from "node:crypto";
import { ERRORS } from "../../constants/errors";
import { STACKHOLDER } from "../../constants/stackholder";
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
    const sos = await sosRepository.findByIdAndVehicleId(data.user_id, data.vehicle_id);
    if (sos.status !== SOSStatus.DONE) {
      throw new BusinessRuleError(STACKHOLDER.SOS + ERRORS.ALREADY_PROCESSED);
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
    if (!sos) throw new NotFoundError(STACKHOLDER.SOS);

    if (sos.status !== SOSStatus.REQUESTED)
      throw new BusinessRuleError(STACKHOLDER.SOS + ERRORS.ALREADY_PROCESSED);

    const mechanic = await userRepository.findAvailableMechanics(
      data.mechanic_id,
    );
    if (!mechanic) throw new NotFoundError(STACKHOLDER.MECHANIC);

    const assignment = await tryAssignMechanic(
      data.sos_request_id,
      data.mechanic_id,
    );

    await notifySosAssignmentKafka(sos);

    return assignment;
  },

  async updateStatus(data: UpdateSOSStatusDTO) {
    const sos = await sosRepository.findById(data.sos_request_id);
    if (!sos) throw new NotFoundError(STACKHOLDER.SOS);

    const validTransitions: Record<SOSStatus, SOSStatus[]> = {
      REQUESTED: [SOSStatus.ASSIGNED, SOSStatus.CANCELED],
      ASSIGNED: [SOSStatus.ON_PROGRESS, SOSStatus.CANCELED],
      ON_PROGRESS: [SOSStatus.DONE],
      DONE: [],
      CANCELED: [],
    };

    const allowed = validTransitions[sos.status];
    if (!allowed.includes(data.status)) {
      throw new BusinessRuleError(
        `${ERRORS.INVALID_TRANSITION} from ${sos.status} to ${data.status}`,
      );
    }

    return sosRepository.updateStatus(data.sos_request_id, data.status);
  },

  async getSOSDetail(id: string) {
    const sos = await sosRepository.findById(id);
    if (!sos) throw new NotFoundError(STACKHOLDER.SOS);

    return sos;
  },

  async autoAssign(sosRequestId: string) {
    const sos = await sosRepository.findById(sosRequestId);

    if (!sos) throw new NotFoundError(STACKHOLDER.SOS);

    if (sos.status !== SOSStatus.REQUESTED) {
      throw new BusinessRuleError(STACKHOLDER.SOS + ERRORS.ALREADY_PROCESSED);
    }

    const mechanics = await userService.getMechanicNearby(
      sos.latitude,
      sos.longitude,
      MIN_RADIUS_IN_KM,
    );
    if (mechanics.length == 0)
      throw new BusinessRuleError(STACKHOLDER.SOS + ERRORS.NO_MECHANICS_AVAILABLE);

    for (const mechanic of mechanics) {
      const locked = await tryLockMechanic(mechanic.id);
      if (!locked) continue;

      try {
        const result = await prisma.$transaction(async (tx) => {
          const freshMechanic = await tx.user.findUnique({
            where: { id: mechanic.id },
          });

          if (!freshMechanic?.is_available)
            throw new BusinessRuleError(STACKHOLDER.MECHANIC + ERRORS.ALREADY_TAKEN);

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
