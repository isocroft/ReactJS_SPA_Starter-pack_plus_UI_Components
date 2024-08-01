import React from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { StaticContext, RouteComponentProps } from "react-router";
import type { Location } from "history";

import { renderBreadcrumbs } from "../../helpers/render-utils";
import { RoutePaths } from "../../routes/routes.paths";

export const usePageDataLoader = () => {
  return null;
};

export const RoutePath = RoutePaths.HOME;

export const PageHeader = ({
  breadcrumbs,
}: Pick<RouteComponentProps<{}, StaticContext, object>, "history"> & {
  user: {
    permission: string;
    bio?: Record<string, string | number>;
  };
  breadcrumbs: Location[];
}) => {
  return (
    <>
      <h2>{"Home"}</h2>
      <div id="breadcrumbs">{renderBreadcrumbs(breadcrumbs)}</div>
    </>
  );
};

export const PageTitle = "Home *";

export const renderPage = (
  location: Location,
  query: UseQueryResult | null,
  PageElement: React.LazyExoticComponent<
    React.ComponentType<{ query: UseQueryResult | null } | undefined>
  >
) => {
  return <PageElement key={location.key} query={query} />;
};

const Home = (injected: { query: UseQueryResult | null } | undefined) => {
  if (!injected || !injected.query) {
    return null;
  }
  return <h1>Home</h1>;
};

export default Home;
