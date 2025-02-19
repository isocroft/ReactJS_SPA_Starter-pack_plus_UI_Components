import React from "react";
import { Span } from "@opentelemetry/api";

export {};

declare class Stringified<T> extends String {
  private ___stringified: T
}

type HeadwayConfig = {
  selector: string;
  account: string;
  trigger: string;
  position?: {
    x: string;
    y: string
  };
  translations?: {
    title: string;
    readMore: string;
    labels: Record<string, string>;
    footer: string;
  };
  callbacks?: {
    onWidgetReady: (widget?: { getUnseenCount: Function }) => void;
    onShowWidget: () => void;
    onShowDetails: (changelog: { id: string; title: string }) => void;
    onHideWidget: () => void;
  };
};

type NewRelicInteraction = {
  save: () => void;
  setName: (name: string, trigger?: string) => NewRelicInteraction;
  setAttribute: (
    attributeName: string,
    attributeValue: unknown
  ) => NewRelicInteraction;
};

type NewRelicTraceData = {
  start: number;
  end: number;
  name: string;
  origin: string;
  type: string;
};

declare global {
  interface DocumentEventMap {
    ["filezonedropaction"]: CustomEvent<{ files: FileList | null }>;
  }

  interface IDBEventTarget extends EventTarget {
    result: IDBDatabase;
  }

  interface IDBEvent extends IDBVersionChangeEvent {
    target: IDBEventTarget;
  }

  interface DataTransfer {
    dropEffect: "none" | "copy" | "link" | "move";
    effectAllowed : "none" | "copy" | "copyLink" | "move";
    setData: (format: string, data: string) => void
  }

  interface DragEvent extends Event { 
    dataTransfer: DataTransfer
  }

  interface File extends Blob {
    readonly lastModified: number;
    readonly name: string;
    readonly webkitRelativePath: string;
  }

  interface Navigator {
    readonly standalone?: boolean;
    msSaveBlob?: (blob: Blob, defaultName?: string) => boolean;
    msSaveOrOpenBlob: (blobOrBase64: Blob | string, filename: string) => void;
  }

  interface Window {
    cloudinary: any;
    gtag: (...args: any[]) => void;
    JSON: {
      stringify<T>(
          value: T,
          replacer?: (key: string, value: any) => any,
          space?: string | number
      ): string & Stringified<T>
      parse<T>(text: string | Stringified<T>, reviver?: (key: any, value: any) => any): T | null
      parse(text: string, reviver?: (key: any, value: any) => any): any
    };
    Cookies: {
      get: (name: string) => string | undefined
    };
    bindingSpan: Span | undefined;
    startBindingSpan: (spanName: string, traceId: string, spanId: string, traceFlags: number) => void;
    Headway: {
      init: (config: HeadwayConfig) => void;
    };
    newrelic: {
      noticeError: (error: Error, payload: Record<string, unknown>) => void;
      finished: (time?: Date) => void;
      addToTrace: (traceData: NewRelicTraceData) => void;
      addRelease: (releaseName: string, releaseId: string) => void;
      addPageAction: (
        actionName: string,
        JSONPayload: Record<
          string,
          string | boolean | unknown[] | null | number
        >
      ) => void;
      setCurrentRoutename: (routeName: string) => void;
      setCustomAttribute: (
        attributeName: string,
        attributeValue: number | string
      ) => void;
      setErrorHandler: (callback: (error: Error) => boolean) => void;
      setPageViewName: (viewName: string, viewHost?: string) => void;
      interaction: () => NewRelicInteraction;
    };
  }
}
