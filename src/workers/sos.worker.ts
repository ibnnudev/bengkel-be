import { kafka } from "../infrastructure/kafka/kafka";
import { KAFKA_TOPICS } from "../infrastructure/kafka/topic";
import { sosService } from "../modules/sos/sos.service";
import { logger } from "../lib/logger";

const consumer = kafka.consumer({ groupId: "sos-group" });

export const startSOSWorker = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: KAFKA_TOPICS.CREATED,
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const raw = message.value ? message.value.toString() : null;
      try {
        logger.info({ topic, value: raw }, "Kafka message received");
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log("Kafka message:", topic, raw);
      }

      if (!raw) return;

      let payload: any = null;
      try {
        payload = JSON.parse(raw);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to parse kafka message", err, raw);
        return;
      }

      try {
        await sosService.autoAssign(payload.sosRequestId);
      } catch (error) {
        console.error("Auto assign failed:", error);
      }
    },
  });
};
