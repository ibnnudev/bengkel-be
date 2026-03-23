import "dotenv/config";
import app from "./src/app";
import { kafkaProducer } from "./src/infrastructure/kafka/kafka";
import { logger } from "./src/lib/logger";

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await kafkaProducer.connect();
    logger.info("Kafka connected");
  } catch (error: any) {
    logger.error({ message: error.message }, "Create SOS failed");

    throw error;
  }

  app.listen(PORT, () => {
    logger.info({ port: PORT }, "Server started");
  });
};

start();
