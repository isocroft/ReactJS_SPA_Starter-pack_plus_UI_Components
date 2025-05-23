import "./styles.css";
import React, { useEffect } from "react";
import { useBrowserStorage, useBus } from "react-busser";
import {
  Link
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import AppLayout from "./layouts/AppLayout";
import BrowserEventToasts from "./components/UI_Widgets/BrowserEventToasts";

import { ProtectedRoutes, UnProtectedRoutes } from "./routes/routes.config";


export type ExcludeFromProps<P, X extends { [key: string]: unknown }> = Pick<
  P,
  Exclude<keyof P, keyof X>
>;

export type PickValueType<R> = R[keyof R];

const withAuth = (WrappedComponent: React.FunctionComponent<{ isAuthenticated: boolean }>) => {
  const WithAuth = (props: ExcludeFromProps<{ isAuthenticated: boolean }, { isAuthenticated: boolean }>) => {
    const [bus] = useBus({
      fires: [],
      subscribes: ["app.logout"]
    }, "withAuth.LogOut.Routine");
    const { getFromStorage, clearFromStorage } = useBrowserStorage({ storageType: "session" });
    const user = getFromStorage<{ email: string, id: string } | null>("__USR_$_", null);

    useEffect(() => {
      const handleLogOut = () => {
        clearFromStorage("__USR_$_");
      };

      bus.on("app.logout", handleLogOut);
      
      return () => {
        bus.off(handleLogOut);
      }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    },[]);

    return <WrappedComponent isAuthenticated={user !== null} {...props} />
  }
  return WithAuth;
};

function App({ isAuthenticated }) {
  return (
    <AppLayout
      className="App"
      lockUnsavedChanges={true}
      browserPromptText={"You seem to have unsaved changes, Are you sure you want to discard them?"}
    >
      <BrowserEventToasts />
      <AppLayout.RouteNavigation>
        {isAuthenticated ? null : (<nav className="">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
          </ul>
        </nav>)}
      </AppLayout.RouteNavigation>
      <AnimatePresence mode="wait">
        <AppLayout.RoutePages
          routes={isAuthenticated ? ProtectedRoutes : UnProtectedRoutes}
        />
      </AnimatePresence>
    </AppLayout>
  );
};

export default withAuth(App);
