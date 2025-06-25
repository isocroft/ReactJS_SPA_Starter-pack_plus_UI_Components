import React, { useEffect, Suspense } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { StaticContext, RouteComponentProps } from "react-router";
import { useHistory } from "react-router-dom";
import type { Location } from "history";
import {
  useBrowserStorage,
  //usePreviousRoutePathname,
} from "react-busser";

import { HomeRoute } from "./pages.groupings/home.page";
import { VehicleRoute } from "./pages.groupings/vehicles.page";

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
      queries: Record<string, UseQueryResult | null>,
      user: {
        permission: string;
        bio?: Record<string, string | number>;
      };
    }
  >;
  PageElement: React.LazyExoticComponent<
    React.ComponentType<{ queries: Record<string, UseQueryResult | null> } | undefined>
  >;
  useDataLoader: (location: Location) => Record<string, UseQueryResult | null>;
  renderProp: (
    location: Location,
    queries: Record<string, UseQueryResult | null>,
    PageElement: React.LazyExoticComponent<
      React.ComponentType<{ queries: Record<string, UseQueryResult | null> } | undefined>
    >,
    user: {
      permission: string;
      bio?: Record<string, string | number>;
    }
  ) => JSX.Element | null;
}

function dataLoaderQueriesLoading(queries: Record<string, UseQueryResult | null>) {
  let result = false;
  for (let key in queries) {
    query = queries[key] || { isLoading: false };
    result = result || query.isLoading;
    if (result) {
      break;
    }
  }
  return result;
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

  //const previousPathname = usePreviousRoutePathname();
  const history = useHistory<object>();

  const queries = useDataLoader(history.location);
  const { getFromStorage } = useBrowserStorage({
    storageType: "local",
  });

  if (dataLoaderQueriesLoading(queries)) {
    return (<div>{Loading...}</div>);
  }

  return (
    <section id="page">
      <Header
        history={history}
        queries={queries}
        user={getFromStorage("user", {
          permission: "owner",
          bio: {},
        })}
      />
      <Suspense fallback={<div>Loading....</div>}>
        {renderProp(
          history.location,
          queries,
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
