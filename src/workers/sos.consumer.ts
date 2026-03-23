import { Kafka } from "kafkajs";
import { KAFKA_TOPICS } from "../infrastructure/kafka/topic";
import { sosService } from "../modules/sos/sos.service";
import { logger } from "../lib/logger";

const kafka = new Kafka({
    clientId: process.env.KAFKA_CONSUMER_CLIENT_ID || "sos.consumer",
    brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
})

const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID || "sos.group" });

export const startSOSConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: KAFKA_TOPICS.CREATED});

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

            let data: any = null;
            try {
                data = JSON.parse(raw);
            } catch (err) {
                // malformed JSON - still log and return
                // eslint-disable-next-line no-console
                console.error("Failed to parse kafka message", err, raw);
                return;
            }

            try {
                await sosService.autoAssign(data.sosRequestId);
            } catch (error) {
                console.error("Auto assign failed:", error);
            }
        }
    })
}