import React from "react";

export {};

declare class Stringified<T> extends String {
  private ___stringified: T
}

declare global {
  interface IDBEventTarget extends EventTarget {
    result: IDBDatabase;
  }

  interface IDBEvent extends IDBVersionChangeEvent {
    target: IDBEventTarget;
  }

  interface File extends Blob {
    readonly lastModified: number;
    readonly name: string;
    readonly webkitRelativePath: string;
  }

  interface Navigator {
    readonly standalone?: boolean;
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
    }
  }
}
