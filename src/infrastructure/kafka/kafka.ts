import { Kafka } from "kafkajs";

export const kafka = new Kafka({
    clientId: process.env.KAFKA_PRODUCER_CLIENT_ID,
    brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
});

const producer = kafka.producer();

export const kafkaProducer = {
    async connect() {
        await producer.connect();
    },

    async send(topic: string, message: any) {
        await producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }],
        })
    }
}

