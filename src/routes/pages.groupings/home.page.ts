import { componentLoader, lazyWithRetry } from "../../helpers/import-utils";

import {
  usePageDataLoader,
  PageHeader,
  PageTitle,
  RoutePath,
  renderPage,
} from "../../pages/Home";

const Home = lazyWithRetry(() =>
  componentLoader(() => import("../../pages/Home/index"))
);

export const HomeRoute = {
  path: RoutePath,
  element: Home,
  loadData: usePageDataLoader,
  renderProp: renderPage,
  Header: PageHeader,
  Title: PageTitle,
};
