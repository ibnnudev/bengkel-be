import { pinoHttp } from "pino-http";
import { logger } from "../lib/logger";
import { randomUUID } from "node:crypto";

export const httpLogger = pinoHttp({
  logger: logger,
  genReqId: () => randomUUID(),
  autoLogging: false,
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },

  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} failed`;
  }
});
