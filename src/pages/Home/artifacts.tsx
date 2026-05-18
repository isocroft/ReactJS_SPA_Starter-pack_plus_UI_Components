import React from "react";
import type { UseQueryResult } from "@tanstack/react-query";

import type { StaticContext, RouteComponentProps } from "react-router";
import type { Location } from "history";

import { breadcrumbsMap } from "../../routes/routes.breadcrumbs.map";
import { useRoutingBreadCrumbsData } from "../../layouts/GlobalRoutingProvider";
import { RoutePaths } from "../../routes/routes.paths";

export const usePageDataLoader = (location: Location<unknown>) => {
  /* @HINT: Pretending to be a call to `useQuery()` */
  const query = {
    data: [{ id: 123 }, { id: 456 }] as Array<{ id: number }>,
    isLoadingError: false as false,
    isRefetchError: false as false,
    isPlaceholderData: false as false,
    isFetched: false as false,
    isFetchedAfterMount: false as false,
    isInitialLoading: false as false,
    isPaused: false as false,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    dataUpdatedAt: 0,
    isRefetching: false as false,
    isStale: false as false,
    fetchStatus: "idle" as const,
    promise: Promise.resolve([{ id: 123 }, { id: 456 }] as Array<{
      id: number;
    }>),
    status: "success" as const,
    refetch: () =>
      Promise.resolve({ data: [{ id: 376 }] } as unknown as UseQueryResult<
        Array<{ id: number }>,
        Error
      >),
    fetchNextPage: () => ({}),
    isPending: false as false,
    isFetching: false as false,
    isLoading: false as false,
    error: null,
    isError: false as false,
    isSuccess: true as true,
  } as UseQueryResult<Array<{ id: number }>, Error>;

  return {
    home: query,
  };
};

export const RoutePath = RoutePaths.HOME;

export const PageHeader = ({
  history,
  queries,
  user,
}: Pick<RouteComponentProps<{}, StaticContext, object>, "history"> & {
  queries: Record<"home", UseQueryResult<Array<{ id: number }>, Error> | null>;
  user: {
    roles: string[];
    permissions: string[];
    bio?: Record<string, string | number>;
  };
}) => {
  const BreadCrumbsList = useRoutingBreadCrumbsData(breadcrumbsMap, {
    onNavigation({ previousPathname }) {
      console.log("navigation=>prev: ", previousPathname);
    },
  });
  return (
    <>
      <h2>{"Home"}</h2>
      <div id="breadcrumbs">
        <BreadCrumbsList className="" />
      </div>
    </>
  );
};

export const PageTitle = "Home *";

export const renderPage = (
  location: Location,
  queries: Record<string, UseQueryResult<Array<{ id: number }>, Error> | null>,
  PageElement: React.LazyExoticComponent<
    React.ComponentType<
      | {
          queries: Record<
            string,
            UseQueryResult<Array<{ id: number }>, Error> | null
          >;
        }
      | undefined
    >
  >
) => {
  return <PageElement key={location.key} queries={queries} />;
};
