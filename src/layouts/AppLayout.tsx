import React, { useEffect, useMemo } from "react";
import { useRoutingMonitor, useUnsavedChangesLock } from "react-busser";
import {
  BrowserRouter as Router,
  HashRouterProps,
  Route,
} from "react-router-dom";
import { Redirect, Switch } from "react-router";
import type { Location } from "history";

import { RoutePaths } from "../routes/routes.paths";
import { ProtectedRoutes, UnProtectedRoutes } from "../routes/routes.config";

const AppLayout = ({
  lockUnsavedChanges = false,
  className = "",
  children = null,
}: {
  lockUnsavedChanges?: boolean;
  className?: string;
  children?: React.ReactNode;
}) => {
  document.documentElement.classList.toggle("app-layout");

  /* @NOTE: Using the `useUnsavedChangesLock()` ReactJS hook */
  const { getUserConfirmation } = useUnsavedChangesLock({
    useBrowserPrompt: true,
  });

  useEffect(() => {
    () => {
      document.documentElement.classList.toggle("app-layout");
    };
  }, []);

  return (
    <main className={className}>
      <Router
        getUserConfirmation={
          lockUnsavedChanges ? getUserConfirmation : undefined
        }
      >
        {children}
      </Router>
    </main>
  );
};

const ProtectedPages = ({
  getUserConfirmation,
}: Pick<HashRouterProps, "getUserConfirmation">) => {
  /* @NOTE: Using the `useRoutingMonitor()` ReactJS hook */
  const { getBreadCrumbsList } = useRoutingMonitor({
    getUserConfirmation: getUserConfirmation || (() => false),
    /* onNavigation() gets called each time the route changes */
    onNavigation: (
      history,
      { previousPathname, currentPathname, navigationDirection }
    ) => {
      /* Can setup Hotjar Events API, Segment or Rudderstack analytics here */
      console.log(
        previousPathname,
        currentPathname,
        navigationDirection,
        history
      );
    },
  });

  return (
    <Switch>
      {ProtectedRoutes.map((route) => {
        return (
          <Route
            key={route.path}
            exact={route.exact}
            path={route.path}
            component={({ location }: { location: Location }) => {
              const breadcrumbs = useMemo(
                () => getBreadCrumbsList(route.path),
                [location.key]
              );
              return (
                <route.component
                  breadcrumbs={breadcrumbs}
                  location={location}
                />
              );
            }}
          />
        );
      })}
      <Redirect to={RoutePaths.ERROR} />
    </Switch>
  );
};

const UnprotectedPages = ({
  getUserConfirmation,
}: Pick<HashRouterProps, "getUserConfirmation">) => {
  /* @NOTE: Using the `useRoutingMonitor()` ReactJS hook */
  const { getBreadCrumbsList } = useRoutingMonitor({
    getUserConfirmation: getUserConfirmation || (() => false),
    /* onNavigation() gets called each time the route changes */
    onNavigation: (
      history,
      { previousPathname, currentPathname, navigationDirection }
    ) => {
      /* Can setup Hotjar Events API, Segment or Rudderstack analytics here */
      console.log(
        previousPathname,
        currentPathname,
        navigationDirection,
        history
      );
    },
  });

  return (
    <Switch>
      {UnProtectedRoutes.map((route) => {
        return (
          <Route
            key={route.path}
            exact={route.exact}
            path={route.path}
            component={({ location }: { location: Location }) => {
              const breadcrumbs = useMemo(
                () => getBreadCrumbsList(route.path),
                [location.key]
              );
              return (
                <route.component
                  breadcrumbs={breadcrumbs}
                  location={location}
                />
              );
            }}
          />
        );
      })}
      <Redirect to={RoutePaths.ERROR} />
    </Switch>
  );
};

AppLayout.ProtectedPages = ProtectedPages;
AppLayout.UnprotectedPages = UnprotectedPages;

export default AppLayout;
