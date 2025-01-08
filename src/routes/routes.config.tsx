import React, { useEffect, Suspense } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { StaticContext, RouteComponentProps } from "react-router";
import { useHistory } from "react-router-dom";
import type { Location } from "history";
import {
  useBrowserStorage,
  useIsFirstRender,
  usePreviousRoutePathname,
} from "react-busser";

import { HomeRoute } from "./pages.groupings/home.pages";
import { VehicleRoute } from "./pages.groupings/vehicles.pages";

type ReactRoutingFunctionalComponent = () => JSX.Element | null;

export interface RoutesInterface {
  path: string;
  exact: boolean;
  isPrivate?: boolean;
  component:
    | React.LazyExoticComponent<ReactRoutingFunctionalComponent>
    | ReactRoutingFunctionalComponent;
}

interface DecoratedComponentProps<T = object> {
  Title: string;
  Header: React.FC<
    Pick<RouteComponentProps<{}, StaticContext, T>, "history"> & {
      user: {
        permission: string;
        bio?: Record<string, string | number>;
      };
    }
  >;
  PageElement: React.LazyExoticComponent<
    React.ComponentType<{ query: UseQueryResult | null } | undefined>
  >;
  useDataLoader: () => UseQueryResult | null;
  renderProp: (
    location: Location,
    query: UseQueryResult | null,
    PageElement: React.LazyExoticComponent<
      React.ComponentType<{ query: UseQueryResult | null } | undefined>
    >,
    user: {
      permission: string;
      bio?: Record<string, string | number>;
    }
  ) => JSX.Element | null;
}

const PageRenderer: React.FC<DecoratedComponentProps> = ({
  Header,
  renderProp,
  useDataLoader,
  Title,
  PageElement,
}) => {
  const [titleTag] = Array.from(
    document.documentElement.getElementsByTagName("title")
  );

  titleTag.textContent = Title + " | React App";
  document.title = Title + " | React App";

  const query = useDataLoader();
  const isFirstRender = useIsFirstRender();
  const { getFromStorage } = useBrowserStorage({
    storageType: "local",
  });

  const previousPathname = usePreviousRoutePathname();
  const history = useHistory<object>();

  useEffect(() => {
    if (!isFirstRender || previousPathname === history.location.pathname) {
      if (query !== null) {
        query.refetch();
      }
    }
  }, [
    query,
    isFirstRender,
    previousPathname,
    history.location.pathname,
  ]);

  return (
    <section id="page">
      {
        <Header
          history={history}
          user={getFromStorage("user", {
            permission: "owner",
            bio: {},
          })}
        />
      }
      <Suspense fallback={<span>Loading....</span>}>
        {renderProp(
          history.location,
          query,
          PageElement,
          getFromStorage("user", {
            permission: "owner",
            bio: {},
          })
        )}
      </Suspense>
    </section>
  );
};

export const ProtectedRoutes: RoutesInterface[] = [
  {
    path: VehicleRoute.path,
    exact: true,
    isPrivate: true,
    component: () => (
      <PageRenderer
        Header={VehicleRoute.Header}
        renderProp={VehicleRoute.renderProp}
        Title={VehicleRoute.Title}
        PageElement={VehicleRoute.element}
        useDataLoader={VehicleRoute.loadData}
      />
    ),
  },
];

export const UnProtectedRoutes: RoutesInterface[] = [
  {
    path: HomeRoute.path,
    exact: true,
    isPrivate: false,
    component: () => (
      <PageRenderer
        Header={HomeRoute.Header}
        renderProp={HomeRoute.renderProp}
        Title={HomeRoute.Title}
        PageElement={HomeRoute.element}
        useDataLoader={HomeRoute.loadData}
      />
    ),
  },
];
