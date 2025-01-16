import React, { useTransition, PropsWithChildren } from "react";
import {
  Route,
} from "react-router-dom";
import { Redirect, Switch } from "react-router";

import { ErrorBoundary } from "../shared/providers/ErrorBoundary";
import GlobalRoutingProvider, { GlobalRoutingContextProps } from "./GlobalRoutingProvider";
import { RoutePaths } from "../routes/routes.paths";

import type { Location } from "history";
import type { RoutesInterface } from "./routes/routes.config";

import { hasChildren } from "../helpers/render-utils";
//import type { HashRouterProps } from "react-router-dom";

const AppLayout = ({
  breadcrumbsMap = {}
  className = "",
  children
}: PropsWithChildren<{
  breadcrumbsMap?: Record<string, string>;
  className?: string;
  onAppNavigation?: GlobalRoutingContextProps["onGlobalNavigation"];
}>) => {
  const [isPending, startTransition] = useTransition({ timeoutMS: 3500 });

  if (isPending) {
    document.documentElement.classList.add("app-busy");
  } else {
    document.documentElement.classList.remove("app-busy");
    document.documentElement.classList.remove("browser-navigation-animate");
  }
  
  return (
    <main className={className}>
      <GlobalRoutingProvider onGlobalNavigation={({ previousPathname })=> {
        startTransition(() => {
          document.documentElement.classList.add("browser-navigation-animate");
        });
      }} breadcrumbsMap={breadcrumbsMap}>
        {children}
      </GlobalRoutingProvider>
    </main>
  );
};

const RouteNavigation = ({ children?: React.ReactNode }) => {
  if (hasChildren(children, 0)) {
    return null;
  }
  return (
    <aside>
      {children}
    </aside>
  );
};

const RoutePages = (routes: RoutesInterface[]) => { 
/* {
  getUserConfirmation,
}: Pick<HashRouterProps, "getUserConfirmation"> */
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
};


AppLayout.RoutePages = RoutePages;
AppLayout.RouteNavigation = RouteNavigation;

export default AppLayout;
