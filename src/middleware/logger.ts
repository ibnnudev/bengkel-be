import type { Request, Response, NextFunction } from "express";
import { trace } from "@opentelemetry/api";
import { logger } from "../lib/logger";

export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // ✅ capture span SEKALI di awal (biar context tidak hilang)
  const span = trace.getActiveSpan();
  const spanContext = span?.spanContext();

  res.on("finish", () => {
    const duration = Date.now() - start;

    const attrs = {
      "http.method": req.method,
      "http.target": req.originalUrl,
      "http.status_code": res.statusCode,
      "http.duration_ms": duration,
    };

    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 500) {
      logger.error(attrs, message);
    } else if (res.statusCode >= 400) {
      logger.warn(attrs, message);
    } else {
      logger.info(attrs, message);
    }
  });

  next();
};