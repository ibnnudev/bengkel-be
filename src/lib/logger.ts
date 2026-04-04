import { logs, SeverityNumber, type AnyValueMap } from "@opentelemetry/api-logs";
import { trace, context } from "@opentelemetry/api";

const otelLogger = logs.getLogger("bengkel-be");

type LogAttributes = AnyValueMap;

function emit(
  severityNumber: SeverityNumber,
  severityText: string,
  message: string,
  attrs?: LogAttributes
) {
  const span = trace.getActiveSpan();
  const spanContext = span?.spanContext();

  const base = {
    timestamp: new Date().toISOString(), 
    severity: severityText,
    message,
  };

  const traceFields =
    spanContext && {
      trace_id: spanContext.traceId,
      span_id: spanContext.spanId,
    };

  const log: AnyValueMap = {
    ...base,
    ...(attrs || {}),
    ...traceFields,
  };

  otelLogger.emit({
    severityNumber,
    severityText,
    body: message,
    attributes: log,
  });

  const out = JSON.stringify(log);

  if (severityNumber >= SeverityNumber.ERROR) {
    console.error(out);
  } else if (severityNumber >= SeverityNumber.WARN) {
    console.warn(out);
  } else {
    console.log(out);
  }
}

export const logger = {
  info(input: LogAttributes | string, msg?: string) {
    if (typeof input === "string") {
      emit(SeverityNumber.INFO, "INFO", input);
    } else {
      emit(SeverityNumber.INFO, "INFO", msg ?? "", input);
    }
  },

  warn(input: LogAttributes | string, msg?: string) {
    if (typeof input === "string") {
      emit(SeverityNumber.WARN, "WARN", input);
    } else {
      emit(SeverityNumber.WARN, "WARN", msg ?? "", input);
    }
  },

  error(input: LogAttributes | string, msg?: string) {
    if (typeof input === "string") {
      emit(SeverityNumber.ERROR, "ERROR", input);
    } else {
      emit(SeverityNumber.ERROR, "ERROR", msg ?? "", input);
    }
  },
};