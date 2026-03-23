import { kafka } from "../infrastructure/kafka/kafka";
import { KAFKA_TOPICS } from "../infrastructure/kafka/topic";
import { sosService } from "../modules/sos/sos.service";

const consumer = kafka.consumer({ groupId: "sos-group" });

export const startSOSWorker = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: KAFKA_TOPICS.CREATED,
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      const payload = JSON.parse(message.value.toString());

      try {
        await sosService.autoAssign(payload.sosRequestId);
      } catch (error) {
        console.error("Auto assign failed:", error);
      }
    },
  });
};
