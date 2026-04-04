import { randomUUID } from "node:crypto";
import { ERRORS } from "../../constants/errors";
import { STACKHOLDER } from "../../constants/stackholder";
import { AssignmentStatus, OrderStatus } from "../../../generated/prisma";
import { BusinessRuleError } from "../../error/business-rule.error";
import { NotFoundError } from "../../error/not-found.error";
import { kafkaProducer } from "../../infrastructure/kafka/kafka";
import { KAFKA_TOPICS } from "../../infrastructure/kafka/topic";
import { tryLockMechanic } from "../../infrastructure/redis/lock-mechanic";
import { logger } from "../../lib/logger";
import { prisma } from "../../prisma";
import { userRepository } from "../user/user.repository";
import { userService } from "../user/user.service";
import { notifyOrderAssignmentKafka, tryAssignMechanic } from "./order.helper";
import { orderRepository } from "./order.repository";
import type {
  AssignMechanicDTO,
  CreateOrderDTO,
  UpdateOrderStatusDTO,
} from "./order.type";

const MIN_RADIUS_IN_KM = 10;

export const orderService = {
  async createOrder(data: CreateOrderDTO) {
    const order = await orderRepository.findByIdAndVehicleId(
      data.user_id,
      data.vehicle_id,
    );
    if (order.status !== OrderStatus.DONE) {
      throw new BusinessRuleError(STACKHOLDER.SOS + ERRORS.ALREADY_PROCESSED);
    }

    await kafkaProducer.send(KAFKA_TOPICS.CREATED, {
      orderRequestId: order.id,
      latitude: order.latitude,
      longitude: order.longitude,
    });

    return order;
  },

  async assignMechanic(data: AssignMechanicDTO) {
    const order = await orderRepository.findById(data.order_id);
    if (!order) throw new NotFoundError(STACKHOLDER.SOS);

    if (order.status !== OrderStatus.REQUESTED)
      throw new BusinessRuleError(STACKHOLDER.SOS + ERRORS.ALREADY_PROCESSED);

    const mechanic = await userRepository.findAvailableMechanics(
      data.mechanic_id,
    );
    if (!mechanic) throw new NotFoundError(STACKHOLDER.MECHANIC);

    const assignment = await tryAssignMechanic(
      data.order_id,
      data.mechanic_id,
    );

    await notifyOrderAssignmentKafka(order);

    return assignment;
  },

  async updateStatus(data: UpdateOrderStatusDTO) {
    const order = await orderRepository.findById(data.order_request_id);
    if (!order) throw new NotFoundError(STACKHOLDER.SOS);

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      REQUESTED: [OrderStatus.ASSIGNED, OrderStatus.CANCELED],
      WAITING_APPROVAL: [OrderStatus.ON_PROGRESS, OrderStatus.CANCELED],
      ON_THE_WAY: [OrderStatus.ON_PROGRESS, OrderStatus.CANCELED],
      ASSIGNED: [OrderStatus.ON_PROGRESS, OrderStatus.CANCELED],
      ON_PROGRESS: [OrderStatus.DONE],
      DONE: [],
      CANCELED: [],
    };

    const allowed = validTransitions[order.status];
    if (!allowed.includes(data.status)) {
      throw new BusinessRuleError(
        `${ERRORS.INVALID_TRANSITION} from ${order.status} to ${data.status}`,
      );
    }

    return orderRepository.updateStatus(data.order_request_id, data.status);
  },

  async getOrderDetail(id: string) {
    return await orderRepository.findById(id);
  },

  async autoAssignOrder(orderRequestId: string) {
    const sos = await orderRepository.findById(orderRequestId);
    if (sos.status !== OrderStatus.REQUESTED)
      throw new BusinessRuleError(STACKHOLDER.SOS + ERRORS.ALREADY_PROCESSED);

    const mechanics = await userService.getMechanicNearby(
      sos.latitude,
      sos.longitude,
      MIN_RADIUS_IN_KM,
    );

    for (const mechanic of mechanics) {
      const locked = await tryLockMechanic(mechanic.id);
      if (!locked) continue;

      try {
        const result = await prisma.$transaction(async (tx) => {
          const freshMechanic = await tx.user.findUnique({
            where: { id: mechanic.id },
          });

          if (!freshMechanic?.is_available)
            throw new BusinessRuleError(
              STACKHOLDER.MECHANIC + ERRORS.ALREADY_TAKEN,
            );

          await tx.user.update({
            where: { id: mechanic.id },
            data: { is_available: false },
          });

          const assignment = await tx.assignment.create({
            data: {
              id: randomUUID(),
              order_id: orderRequestId,
              mechanic_id: mechanic.id,
              status: AssignmentStatus.PENDING,
            },
          });

          await tx.order.update({
            where: { id: orderRequestId },
            data: { status: OrderStatus.ASSIGNED },
          });

          return assignment;
        });

        await kafkaProducer.send(KAFKA_TOPICS.ASSIGNED, {
          order_id: orderRequestId,
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
