import api, { Span, SpanStatusCode, SpanOptions, SpanKind } from "@opentelemetry/api";

import { OTLPTraceExporter } from "@opentelemetry/exporter-otlp-http";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { SimpleSpanProcessor, ConsoleSpanExporter, BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";

import { envDevelopment, envTest } from "./src/shared/constants";

const provider = new WebTracerProvider({
 resource: new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: process.env.REACT_HONEYCOMB_OTEL_SERVICE_NAME || "isolate-frontend"
 })
});

if (process.env.NODE_ENV === envDevelopment || process.env.NODE_ENV === envTest) {
  const exporter = new ConsoleSpanExporter();
  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
} else {
  const exporter = new OTLPTraceExporter({
    url: process.env.REACT_HONEYCOMB_API_EXPORT_URL || "",
    concurrencyLimit: window.navigator.hardwareConcurrency || 1
  });
  provider.addSpanProcessor(new BatchSpanProcessor(exporter, {
    // The maximum queue size. After the size is reached spans are dropped.
    maxQueueSize: 100,
    // The maximum batch size of every export. It must be smaller or equal to maxQueueSize.
    maxExportBatchSize: 10,
    // The interval between two consecutive exports
    scheduledDelayMillis: 500,
    // How long the export can run before it is cancelled
    exportTimeoutMillis: 30000,
  }));
}

provider.register({
 contextManager: new ZoneContextManager()
});

var bindingSpan: Span | undefined;
const webTracer = provider.getTracer("codesplinta-isolate-frontend");

window.startBindingSpan = (
  spanName: string,
  traceId: string,
  spanId: string,
  traceFlags: number
) => {
  bindingSpan = webTracer.startSpan(spanName);
  bindingSpan.spanContext().traceId = traceId;
  bindingSpan.spanContext().spanId = spanId;
  bindingSpan.spanContext().traceFlags = traceFlags;
};

registerInstrumentations({
  instrumentations: [
    new XMLHttpRequestInstrumentation({
      ignoreUrls: [/localhost/, /session.bugsnag.com/],
      propagateTraceHeaderCorsUrls: [
       /https:\/\/(?:[^.]*)(?:.(staging|dev))?.codesplinta.com(?:\/(.*))?/g
      ]
    })
  ]
});

const isPromise = (object?: { then?: unknown } | null) => {
  return Boolean(object && (typeof object.then === 'function' || Object.prototype.toString.call(object) === "[object Promise]"));
};

const isAsync = (callback: Function) => {
  const string = callback.toString().trim();
  return !! (string.match(/^async /) || callback.constructor.name === "AsyncFunction")
};

const getNewSpan = ({ spanName, asClient = false }: { spanName: string, asClient: boolean }) => {
  return webTracer.startSpan(spanName, {
    kind: asClient ? SpanKind.CLIENT : SpanKind.INTERNAL,
    startTime: new Date(),
  } as SpanOptions, api.context.active())
};

const execOnActiveSpan = <Args extends unknown, RType = any>(spanName: string, workLoad: (...args: Args[]) => RType, ...args: Args[]) =>  {
  return webTracer.startActiveSpan(spanName, span => {
    try {
      const result = workLoad.apply(null, args);
      span.setStatus({code: SpanStatusCode.OK});
      return result;
    } catch (err) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err instanceof Error ? err.message : "An error occured!",
      });
      throw err;
    } finally {
      span.end();
    }
  });
};

async function withTracing<T extends unknown>(
  spanName: string,
  workUnit: Function,
  args: T[],
  tracerName?: string,
) {
 const tracer = api.trace.getTracer(tracerName ||  "codesplinta-isolate-frontend");
 let currentSpan: Span | null = null;
 
 if (window.bindingSpan) {
   const rootContext = api.trace.setSpan(context.active(), window.bindingSpan);
   currentSpan = tracer.startSpan(spanName, undefined, rootContext);
 } else {
   currentSpan = tracer.startSpan(spanName);
 }

  return context.with(trace.setSpan(context.active(), currentSpan), async () => {
    let result: {} | null = null;
    try {
      if (isAsync(workUnit)) {
        result = await workUnit(...args);
      } else {
        result = workUnit.apply(null, args);

        if (isPromise(result)) {
          result = await result;
        }
      }
      return result;
    } catch (error) {
      const workUnitError = error as Error;
      if (currentSpan) {
        currentSpan.setStatus({
          code: SpanStatusCode.ERROR,
          message: workUnitError.message
        });
      }
      throw error;
    } finally {
      if (currentSpan) {
        currentSpan.end();
      }
    }
  });
};

export {
  getNewSpan,
  execOnActiveSpan,
  withTracing
};
