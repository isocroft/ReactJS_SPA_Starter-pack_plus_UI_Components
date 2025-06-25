import { componentLoader, lazyWithRetry } from "../../helpers/import-utils";

import {
  usePageDataLoader,
  PageHeader,
  PageTitle,
  renderPage,
  RoutePath,
} from "../../pages/Vehicles";

const Vehicles = lazyWithRetry(() =>
  componentLoader(() => import("../../pages/Vehicles/index"))
);

export const VehicleRoute = {
  path: RoutePath,
  element: Vehicles,
  loadData: usePageDataLoader,
  Header: PageHeader,
  Title: PageTitle,
  renderProp: renderPage,
};
