import { Kafka } from "kafkajs";
import { KAFKA_TOPICS } from "../infrastructure/kafka/topic";
import { sosService } from "../modules/sos/sos.service";

const kafka = new Kafka({
    clientId: process.env.KAFKA_CONSUMER_CLIENT_ID || "sos.consumer",
    brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
})

const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID || "sos.group" });

export const startSOSConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: KAFKA_TOPICS.CREATED});

    await consumer.run({
        eachMessage: async ({message}) => {
            const data = JSON.parse(message.value!.toString());
            
            try {
                await sosService.autoAssign(data.sosRequestId);
            } catch (error) {
                console.error("Auto assign failed:", error);
            }
        }
    })
}