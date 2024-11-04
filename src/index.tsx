import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import FeaturesToggleProvider from "./shared/providers/FeaturesToggleProvider";
import { envProduction, envDevelopment, envTest } from "./shared/constants";
import config from "./shared/config";
import { install } from "resize-observer";

/* @NOTE: `navigator.clipboard` is undefined in Safari 12.1.x as well as the earlier versions 
  of other browsers like Chrome (Webkit), Firefox, Edge (EdgeHTML) */
/* @CHECK: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard#clipboard_availability */
import "clipboard-polyfill/overwrite-globals"; /* @SHIM: # */

if (!window.ResizeObserver) {
  /* @NOTE: This polyfill installation is for the Safari browser only */
  /* @CHECK: https://stackoverflow.com/a/65832955 */
  install(); /* @SHIM: # */
}

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <FeaturesToggleProvider enabledFeaturesTable={{
      [envDevelopment]: config.DEV_FEATURES_LIST,
      [envTest]: config.DEV_FEATURES_LIST,
      [envProduction]: config.PROD_FEATURES_LIST
    }} environment={config.ENV}>
      <App />
    </FeaturesToggleProvider>
  </React.StrictMode>
);
