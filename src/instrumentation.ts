import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { resourceFromAttributes } from "@opentelemetry/resources";

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: process.env.DD_SERVICE || "bengkel-be",
  "deployment.environment": process.env.DD_ENV || "development",
  [ATTR_SERVICE_VERSION]: process.env.DD_VERSION || "1.0.0",
});

const sdkOptions: any = { resource, instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()] };

if (endpoint) {
  sdkOptions.traceExporter = new OTLPTraceExporter({ url: `${endpoint}/v1/traces` });
  sdkOptions.logRecordProcessor = new SimpleLogRecordProcessor(new OTLPLogExporter({ url: `${endpoint}/v1/logs` }));
}

const sdk = new NodeSDK(sdkOptions);

sdk.start();

process.on("SIGTERM", () => {
  sdk.shutdown().catch(console.error);
});
