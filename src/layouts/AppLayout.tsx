import React, { useEffect, useMemo, PropsWithChildren } from "react";
import {
  Route,
} from "react-router-dom";
import { Redirect, Switch } from "react-router";

import GlobalRoutingProvider, { GlobalRoutingContextProps, useRoutingBreadCrumbsData } from "./GlobalRoutingProvider";
import { RoutePaths } from "../routes/routes.paths";

import type { Location } from "history";
import type { RoutesInterface } from "./routes/routes.config";
//import type { HashRouterProps } from "react-router-dom";

const AppLayout = ({
  breadcrumbsMap = {}
  className = "",
  children,
  onAppNavigation
}: PropsWithChildren<{
  breadcrumbsMap?: Record<string, string>; 
  className?: string;
  onAppNavigation?: GlobalRoutingContextProps["onGlobalNavigation"];
}>) => {
  useEffect(() => {
    () => {
      document.documentElement.classList.toggle("app-layout");
    };
  }, []);

  return (
    <main className={className}>
      <GlobalRoutingProvider onGlobalNavigation={onAppNavigation} breadcrumbsMap={breadcrumbsMap}>
        {children}
      </GlobalRoutingProvider>
    </main>
  );
};

const RouteNavigation = () => {
  return (
    <>{children}</>
  );
};

const RoutePages = (routes: RoutesInterface[]) => { 
/* {
  getUserConfirmation,
}: Pick<HashRouterProps, "getUserConfirmation"> */
  return (
    <Switch>
      {routes.map((route) => {
        return (
          <Route
            key={route.path}
            exact={route.exact}
            path={route.path}
            component={() => {
              return (
                <route.component />
              );
            }}
          />
        );
      })}
      <Redirect to={RoutePaths.ERROR} />
    </Switch>
  );
};


AppLayout.RoutePages = RoutePages;
AppLayout.RouteNavigation = RouteNavigation;

export default AppLayout;
