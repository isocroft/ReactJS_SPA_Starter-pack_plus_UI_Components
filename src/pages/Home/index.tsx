import React from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { StaticContext, RouteComponentProps } from "react-router";
import type { Location } from "history";

import { breadcrumbsMap } from "../../routes/routes.breadcrumbs.map";
import { useRoutingBreadCrumbsData } from "../../layouts/GlobalRoutingProvider";
import { RoutePaths } from "../../routes/routes.paths";

export const usePageDataLoader = () => {
  /* @HINT: Pretending to be a call to `useQuery()` */
  const query = {
    data: [{ id: 123 }, { id: 456 }],
    isLoading: false,
    isError: false,
    status: 'success',
    refetch: () => Promise.resolve({});
  };
  return { home: query } as Record<string, UseQueryResult>;
};

export const RoutePath = RoutePaths.HOME;

export const PageHeader = ({
  history
}: Pick<RouteComponentProps<{}, StaticContext, object>, "history"> & {
  queries: Record<string, UseQueryResult | null>,
  user: {
    permission: string;
    bio?: Record<string, string | number>;
  };
}) => {
  const BreadCrumbsList = useRoutingBreadCrumbsData(breadcrumbsMap, {
    onNavigation ({ previousPathname }) {
      console.log("navigation=>prev: ", previousPathname);
    }
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
  queries: Record<string, UseQueryResult | null>,
  PageElement: React.LazyExoticComponent<
    React.ComponentType<{ queries: Record<string, UseQueryResult | null> } | undefined>
  >
) => {
  return <PageElement key={location.key} queries={queries} />;
};

const Home = (injected: { queries: Record<string, UseQueryResult | null> } | undefined) => {
  if (!injected || !injected.queries) {
    return null;
  }

  return <h1>Home</h1>;
};

export default Home;
