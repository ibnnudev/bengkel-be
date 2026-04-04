import { OrderStatus, type order } from "../../../generated/prisma";
import { kafkaProducer } from "../../infrastructure/kafka/kafka";
import { KAFKA_TOPICS } from "../../infrastructure/kafka/topic";
import { orderRepository } from "./order.repository";

export const tryAssignMechanic = async (
  orderRequestId: string,
  mechanicId: string,
) => {
  await orderRepository.createAssignment(orderRequestId, mechanicId);
  
  const result = await orderRepository.updateAssignment(orderRequestId, OrderStatus.ASSIGNED);

  return result;
};

export const notifyOrderAssignmentKafka = async (order: order) => {
  await kafkaProducer.send(KAFKA_TOPICS.ASSIGNED, {
    key: order.id,
    value: JSON.stringify({
      order_request_id: order.id,
      latitude: order.latitude,
      longitude: order.longitude,
    }),
  });
}
