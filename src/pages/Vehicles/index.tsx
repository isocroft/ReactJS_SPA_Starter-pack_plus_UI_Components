import React from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { StaticContext, RouteComponentProps } from "react-router";
import type { Location } from "history";

//import { renderBreadcrumbs } from "../../helpers/render-utils";
import { useRoutingBreadCrumbsData } from "../../layouts/GlobalRoutingProvider";
import { RoutePaths } from "../../routes/routes.paths";

export const usePageDataLoader = () => {
  return null;
};

export const RoutePath = RoutePaths.VEHICLES;

export const PageHeader = ({
  history,
}: Pick<RouteComponentProps<{}, StaticContext, object>, "history"> & {
  user: {
    permission: string;
    bio?: Record<string, string | number>;
  };
}) => {
  const BreadCrumbsList = useRoutingBreadCrumbsData();
  return (
    <>
      <h2>{"Vehicle"}</h2>
      <div id="breadcrumbs">
        <BreadCrumbsList className="" />
      </div>
    </>
  );
};

export const PageTitle = "Vehicle *";

export const renderPage = (
  location: Location,
  query: UseQueryResult | null,
  PageElement: React.LazyExoticComponent<
    React.ComponentType<{ query: UseQueryResult | null } | undefined>
  >,
  user: { permission: string; bio?: Record<string, string | number> }
) => {
  const TriggerErrorBoundary = () => {
    throw new Error("Invalid page request");
  };

  if (location.pathname === RoutePath) {
    switch (user.permission) {
      case "admin":
      case "owner":
        return <PageElement key={location.key} query={query} />;
      default:
        return <TriggerErrorBoundary />;
    }
  }
  return null;
};

const Vehicles = (injected: { query: UseQueryResult | null } | undefined) => {
  if (!injected || !injected.query || !injected.query.data) {
    return null;
  }
  return <h1>{"Vehicles"}</h1>;
};

export default Vehicles;
