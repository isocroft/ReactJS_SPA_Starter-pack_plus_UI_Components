import React from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { StaticContext, RouteComponentProps } from "react-router";
import type { Location } from "history";

import { breadcrumbsMap } from "../../routes/routes.breadcrumbs.map";
import { useRoutingBreadCrumbsData } from "../../layouts/GlobalRoutingProvider";
import { RoutePaths } from "../../routes/routes.paths";

export const RoutePath = RoutePaths.VEHICLES;

export const PageHeader = ({
  history,
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
      <h2>{"Vehicle"}</h2>
      <div id="breadcrumbs">
        <BreadCrumbsList className="" />
      </div>
    </>
  );
};

export const PageTitle = "Vehicle *";

export const usePageDataLoader = () => {
  return { vehicles: null };
};

export const renderPage = (
  location: Location,
  queries: Record<string, UseQueryResult | null>,
  PageElement: React.LazyExoticComponent<
    React.ComponentType<{ queries: Record<string, UseQueryResult | null> } | undefined>
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
        return <PageElement key={location.key} queries={queries} />;
      default:
        return <TriggerErrorBoundary />;
    }
  }
  return null;
};

const Vehicles = (injected: { queries: Record<string, UseQueryResult | null> } | undefined) => {
  if (!injected || !injected.queries) {
    return null;
  }
  return <h1>{"Vehicles"}</h1>;
};

export default Vehicles;
