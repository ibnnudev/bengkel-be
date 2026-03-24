import { pinoHttp } from "pino-http";
import { logger } from "../lib/logger";
import { randomUUID } from "node:crypto";

export const httpLogger = pinoHttp({
  logger,
  
  genReqId: (_, res) => {
    const id = randomUUID();
    res.setHeader("x-request-id", id);
    return id;
  },

  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${res.responseTime}ms`;
  },

  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${err?.message}`;
  },

  customProps: (req) => ({
    requestId: req.id,
  }),

  autoLogging: false,
});