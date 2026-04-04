import type { Request, Response, NextFunction } from "express";
import { trace, context } from "@opentelemetry/api";
import { logger } from "../lib/logger";

export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const span = trace.getSpan(context.active());
    const traceId = span?.spanContext()?.traceId;

    const attrs = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      ...(traceId && { traceId }),
    };

    if (res.statusCode >= 500) {
      logger.error(attrs, `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    } else if (res.statusCode >= 400) {
      logger.warn(attrs, `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    } else {
      logger.info(attrs, `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });

  next();
};
