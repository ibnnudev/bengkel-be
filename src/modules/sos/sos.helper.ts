import { SOSStatus, type sos_request } from "../../../generated/prisma";
import { kafkaProducer } from "../../infrastructure/kafka/kafka";
import { KAFKA_TOPICS } from "../../infrastructure/kafka/topic";
import { sosRepository } from "./sos.repository";

export const tryAssignMechanic = async (
  sosRequestId: string,
  mechanicId: string,
) => {
  await sosRepository.createAssignment(sosRequestId, mechanicId);
  
  const result = await sosRepository.updateAssignment(sosRequestId, SOSStatus.ASSIGNED);

  return result;
};

export const notifySosAssignmentKafka = async (sos: sos_request) => {
  await kafkaProducer.send(KAFKA_TOPICS.ASSIGNED, {
    key: sos.id,
    value: JSON.stringify({
      sos_request_id: sos.id,
      latitude: sos.latitude,
      longitude: sos.longitude,
    }),
  });
}
