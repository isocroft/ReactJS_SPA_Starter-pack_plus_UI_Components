import React, { useEffect, useMemo, useTransition, PropsWithChildren } from "react";
import { useIsFirstRender, useBus } from "react-busser";
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
  const isFirstRender = useIsFirstRender();
  const [bus] = useBus({ fires:["app:previouspath"], subscribes:[] }, "AppLayout.Component");
  const [isPending, startTransition] = useTransition({ timeoutMS: 3500 });

  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("app-layout");
    };
  }, []);

  if (isPending) {
    document.documentElement.classList.add("app-busy");
  } else {
    document.documentElement.classList.remove("app-busy");
  }

  if (isFirstRender) {
    document.documentElement.classList.add("app-layout");
  }
  
  return (
    <main className={className}>
      <GlobalRoutingProvider onGlobalNavigation={({ previousPathname })=> {
        startTransition(() => {
          bus.emit("app:previouspath", previousPathname);
        });
      }} breadcrumbsMap={breadcrumbsMap}>
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
