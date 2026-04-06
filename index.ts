import "dotenv/config";
import "./src/instrumentation";
import app from "./src/app";
import { kafkaProducer } from "./src/infrastructure/kafka/kafka";
import { startSOSWorker } from "./src/workers/order.worker";
import { logger } from "./src/lib/logger";

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await kafkaProducer.connect();
    logger.info("Kafka producer connected");

    await startSOSWorker();
    logger.info("Kafka SOS worker started");
  } catch (error: any) {
    logger.error({ message: error.message }, "Startup failed");
    throw error;
  }

  app.listen(PORT, () => {
    logger.info({ port: PORT }, "Server started");
  });
};

start();
