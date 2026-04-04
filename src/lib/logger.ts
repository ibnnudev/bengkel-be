import { logs, SeverityNumber } from "@opentelemetry/api-logs";
import { trace, context } from "@opentelemetry/api";

const otelLogger = logs.getLogger("bengkel-be");

type LogAttributes = Record<string, unknown>;

function emit(severityNumber: SeverityNumber, severityText: string, msg: string, attrs?: LogAttributes) {
  const span = trace.getSpan(context.active());
  const spanContext = span?.spanContext();

  otelLogger.emit({
    severityNumber,
    severityText,
    body: msg,
    attributes: {
      ...attrs,
      ...(spanContext
        ? {
            trace_id: spanContext.traceId,
            span_id: spanContext.spanId,
          }
        : {}),
    },
  });

  const traceId = spanContext?.traceId;

  const ddLog: Record<string, unknown> = {
    attributes: attrs || {},
    timestamp: new Date().toISOString(),
    // service: process.env.DD_SERVICE || "bengkel-be",
    // env: process.env.DD_ENV || "development",
    // version: process.env.DD_VERSION || "1.0.0",
    level: severityText,
    message: msg,
  };

  if (traceId) {
    (ddLog as any).trace_id = traceId;
    (ddLog as any).span_id = spanContext?.spanId;
  }

  const out = JSON.stringify(ddLog);

  if (severityNumber >= SeverityNumber.ERROR) {
    console.error(out);
  } else if (severityNumber >= SeverityNumber.WARN) {
    console.warn(out);
  } else {
    console.log(out);
  }
}

export const logger = {
  info(attrs: LogAttributes | string, msg?: string) {
    if (typeof attrs === "string") {
      emit(SeverityNumber.INFO, "INFO", attrs);
    } else {
      emit(SeverityNumber.INFO, "INFO", msg ?? "", attrs);
    }
  },

  warn(attrs: LogAttributes | string, msg?: string) {
    if (typeof attrs === "string") {
      emit(SeverityNumber.WARN, "WARN", attrs);
    } else {
      emit(SeverityNumber.WARN, "WARN", msg ?? "", attrs);
    }
  },

  error(attrs: LogAttributes | string, msg?: string) {
    if (typeof attrs === "string") {
      emit(SeverityNumber.ERROR, "ERROR", attrs);
    } else {
      emit(SeverityNumber.ERROR, "ERROR", msg ?? "", attrs);
    }
  },
};
