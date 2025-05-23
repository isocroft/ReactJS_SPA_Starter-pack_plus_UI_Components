import React from "react";
import ReactDOM from "react-dom/client";
import { EventBusProvider /*, SharedGlobalStateProvider */ } from "react-busser";
import { Toaster } from "sonner";

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
    }} environment={config.ENV} authUserOptions={{ "[identifier]": "id", "[access_control]": "permission" }}>
      <EventBusProvider>
        <Toaster
          position="bottom-right"
          expand
          visibleToasts={4}
          mobileOffset={{ bottom: '12px' }}
          loadingIcon={<span>Loading...</span>}
        />
        <App />
      </EventBusProvider>
    </FeaturesToggleProvider>
  </React.StrictMode>
);
