// @see: https://dana-scheider.medium.com/troubleshooting-dom-leakage-between-tests-with-react-testing-library-a7c5343bb614
import { JSDOM } from 'jsdom';
import { render as originalRender } from '@testing-library/react';

import type { ConstructorOptions } from 'jsdom';
import type { ReactElement } from 'react'; // Only required if using TypeScript
import type { RenderOptions } from '@testing-library/react';

// Global type declarations, can be skipped if not using TypeScript
declare global {
  namespace NodeJS {
    interface Global {
      document: Document
      window: Window
    }
  }
}

// Function to create a new DOM with JSDOM and use it as the source
// of global `window` and `document` objects
const setDom = (options = {} as ConstructorOptions) => {
  // Note that you can set the empty object to any options you would like
  // for your JSDOM instance. You could also make it configurable by allowing
  // the options to be passed in as an argument to the `setDom` function.
  const dom = new JSDOM('<!doctype html><html><body></body></html>', options)

  // The `as` and anything after it can be omitted if you aren't using
  // TypeScript.
  global.window = dom.window as unknown as Window & typeof globalThis
  global.document = dom.window.document
}

// If not using TypeScript, you can just use `(ui) => {`. If you'd like to
// include render options to pass through, you could give this function a
// second optional 'options' argument.
export const render = (ui: ReactElement, options: RenderOptions) => {
  setDom();
  return originalRender(ui, options);
}
