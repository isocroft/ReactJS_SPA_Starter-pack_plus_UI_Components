import React, { /*useTransition,*/ Suspense } from "react";
import {
  Route,
} from "react-router-dom";
import { Redirect, Switch } from "react-router";

import ErrorBoundary from "../shared/providers/ErrorBoundary";
import GlobalRoutingProvider, { GlobalRoutingContextProps } from "./GlobalRoutingProvider";
import { RoutePaths } from "../routes/routes.paths";

import type { PropsWithChildren } from "react";
import type { Location } from "history";
import type { RoutesInterface } from "./routes/routes.config";

import { hasChildren } from "../helpers/render-utils";
//import type { HashRouterProps } from "react-router-dom";

const AppLayout = ({
  className = "",
  children
}: PropsWithChildren<{
  className?: string;
  lockUnsavedChanges? boolean;
  browserPromptText?: string;
}>) => {
  /*const [isPending, startTransition] = useTransition({ timeoutMS: 3500 });

  if (isPending) {
    document.documentElement.classList.add("app-busy");
  } else {
    document.documentElement.classList.remove("app-busy");
    document.documentElement.classList.remove("browser-navigation-animate");
  }

  startTransition(() => {
    document.documentElement.classList.add("browser-navigation-animate");
  });*/
  
  return (
    <main className={className}>
      <GlobalRoutingProvider lockUnsavedChanges={lockUnsavedChanges} browserPromptText={browserPromptText}>
        {children}
      </GlobalRoutingProvider>
    </main>
  );
};

const RouteNavigation = ({ children, className, id }: PropsWithChildren<{
  className?: string,
  id?: string
}>) => {
  if (hasChildren(children, 0)) {
    return null;
  }
  return (
    <aside className={className} id={id}>
      {children}
    </aside>
  );
};

const ErrorFallbackUI = ({ location: Location, error: Error }) => {
  return (
    <div className="">
      Error Messsage: {error.message}
      Error Name: {error.name}
      Page Location Pathname: {location.pathname}
    </div>
  );
};

const RoutePages = ({ routes, FallbackUI }: {
  routes: RoutesInterface[],
  FallbackUI?: React.FunctionComponent<{ location: Location, error: Error }>
}) => { 
/* {
  getUserConfirmation,
}: Pick<HashRouterProps, "getUserConfirmation"> */
  return (
    <ErrorBoundary FallbackUI={FallbackUI ? FallbackUI : ErrorFallbackUI}>
      <Suspense fallback={<div>Loading page data...</div>}>
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
          <Redirect to={RoutePaths.NOT_FOUND} />
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
};


AppLayout.RoutePages = RoutePages;
AppLayout.RouteNavigation = RouteNavigation;

export default AppLayout;
