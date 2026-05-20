import api, {
  Span,
  SpanStatusCode,
  SpanOptions,
  SpanKind,
} from "@opentelemetry/api";

import { OTLPTraceExporter } from "@opentelemetry/exporter-otlp-http";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
  BatchSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";

import type { SpanAttributes } from "@opentelemetry/api";

import { envDevelopment, envTest } from "./src/shared/constants";

const isPrimitive = (target) => {
  return ["number", "boolean", "string", "bigint"].includes(typeof target);
};

const isError = (
  target: unknown
): target is {
  name: string;
  code?: number | string | symbol;
  message: string;
} => {
  if (!(target instanceof Object)) {
    return false;
  }

  if (target instanceof Error) {
    return true;
  }

  return (
    typeof target["code"] === "number" ||
    typeof target["code"] === "string" ||
    typeof target["code"] === "symbol" ||
    target["_tag"] ||
    (typeof target["name"] === "string" &&
      typeof target["message"] === "string")
  );
};

const stringify = (target?: unknown | null) => {
  if (typeof target === "string") {
    return target;
  }

  try {
    return JSON.stringify(target);
  } catch (error) {
    return String(target);
  }
};

const normalizeAsError = (
  target: unknown,
  { cause = undefined } = {} as { cause?: Error }
) => {
  if (isError(target)) {
    return target;
  }

  if (cause === null) {
    cause = undefined;
  }

  return isPrimitive(target)
    ? new Error(stringify(target), { cause })
    : new Error(`Something went wrong`, { cause });
};

const isPromise = (object?: { then?: unknown } | null) => {
  return Boolean(
    object &&
      object instanceof Object &&
      (typeof object.then === "function" ||
        Object.prototype.toString.call(object) === "[object Promise]")
  );
};

const isAsync = (callback: Function) => {
  const string = callback.toString().trim();
  return !!(
    string.match(/^async /) || callback.constructor.name === "AsyncFunction"
  );
};

const provider = new WebTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]:
      process.env.REACT_HONEYCOMB_OTEL_SERVICE_NAME ||
      "savvysynergixe-frontend",
  }),
});

if (
  process.env.NODE_ENV === envDevelopment ||
  process.env.NODE_ENV === envTest
) {
  const exporter = new ConsoleSpanExporter();
  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
} else {
  const exporter = new OTLPTraceExporter({
    url:
      process.env.REACT_HONEYCOMB_API_EXPORT_URL ||
      "https://transport.honeycomb.io/export",
    concurrencyLimit: window.navigator.hardwareConcurrency || 1,
  });
  provider.addSpanProcessor(
    new BatchSpanProcessor(exporter, {
      // The maximum queue size. After the size is reached spans are dropped.
      maxQueueSize: 100,
      // The maximum batch size of every export. It must be smaller or equal to maxQueueSize.
      maxExportBatchSize: 10,
      // The interval between two consecutive exports
      scheduledDelayMillis: 500,
      // How long the export can run before it is cancelled
      exportTimeoutMillis: 30000,
    })
  );
}

provider.register({
  contextManager: new ZoneContextManager(),
});

var bindingSpan: Span | undefined;
const webTracer = provider.getTracer("savvysynergixe-isolate-frontend");

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
        /https:\/\/(?:[^.]*)(?:.(staging|dev))?.savvysynergixe.com(?:\/(.*))?/g,
      ],
    }),
  ],
});

const getNewSpan = ({
  spanName,
  asClient = false,
}: {
  spanName: string;
  asClient: boolean;
}) => {
  return webTracer.startSpan(
    spanName,
    {
      kind: asClient ? SpanKind.CLIENT : SpanKind.INTERNAL,
      startTime: new Date(),
    } as SpanOptions,
    api.context.active()
  );
};

const execOnActiveSpan = <Args extends unknown, RType = any>(
  spanName: string,
  workLoad: (...args: Args[]) => RType,
  attributes: SpanAttributes,
  ...args: Args[]
) => {
  return webTracer.startActiveSpan(
    spanName,
    { attributes, startTime: new Date() },
    (span) => {
      try {
        const result = workLoad.apply(null, args);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (err) {
        const error = normalizeAsError(err);
        if (error) {
          span.recordException(error as Error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });
        }
        throw error;
      } finally {
        span.end();
      }
    }
  );
};

async function withTracing<T extends unknown>(
  spanName: string,
  workUnit: Function,
  args: T[],
  tracerName?: string
) {
  const tracer = api.trace.getTracer(
    tracerName || "savvysynergixe-isolate-frontend"
  );
  let currentSpan: Span | null = null;

  if (window.bindingSpan) {
    const rootContext = api.trace.setSpan(
      api.context.active(),
      window.bindingSpan
    );
    currentSpan = tracer.startSpan(spanName, undefined, rootContext);
  } else {
    currentSpan = tracer.startSpan(spanName);
  }

  return api.context.with(
    api.trace.setSpan(api.context.active(), currentSpan),
    async () => {
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
        const workUnitError = normalizeAsError(error);
        if (currentSpan) {
          currentSpan.recordException(workUnitError as Error);
          currentSpan.setStatus({
            code: SpanStatusCode.ERROR,
            message: workUnitError.message,
          });
        }
        throw workUnitError;
      } finally {
        if (currentSpan) {
          currentSpan.end();
        }
      }
    }
  );
}

export { getNewSpan, execOnActiveSpan, withTracing };
