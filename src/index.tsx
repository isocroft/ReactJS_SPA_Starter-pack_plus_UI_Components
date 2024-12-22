import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import FeaturesToggleProvider from "./shared/providers/FeaturesToggleProvider";
import { envProduction, envDevelopment, envTest } from "./shared/constants";
import config from "./shared/config";
import { install } from "resize-observer";

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
    }} environment={config.ENV} authOwnerOptions={{ "[identifier]": "id", "[access_control]": "permissions.role" }}>
      <App />
    </FeaturesToggleProvider>
  </React.StrictMode>
);
