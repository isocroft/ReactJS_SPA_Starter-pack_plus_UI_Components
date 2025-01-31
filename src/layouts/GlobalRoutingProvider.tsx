import { createContext, useContext, useMemo, PropsWithChildren } from "react";
import {
  BrowserRouter as Router,
  useLocation
} from "react-router-dom";
import { useRoutingMonitor, useUnsavedChangesLock } from "react-busser";

import type { StaticContext, RouteComponentProps } from "react-router";
import type { Location } from "history";

import { renderBreadcrumbs } from "../helpers/render-utils";

export type GlobalRoutingContextProps = {
  breadcrumbsMap: Record<string, string>,
  lockUnsavedChanges?: boolean,
  useBrowserPrompt?: boolean,
  browserPromptText?: string,
  onGlobalNavigation?: (options: Pick<RouteComponentProps<{}, StaticContext, object>, "history"> & {
    previousPathname: string,
    currentPathname: string,
    navigationDirection: 'refreshnavigation' | 'backwardnavigation' | 'forwardnavigation'
  }) => void
};

const GlobalRoutingContext = createContext<GlobalRoutingContextProps>({ breadcrumbsMap: {} });

export const useRoutingBreadCrumbsData = () => {
  const context = useContext(BreadCrumbsContext);
  
  if (!context) {
    throw new Error("This hook requires the <GlobalRoutingProvider/> to be installed");
  }

  return ({ className }) => {
    return renderBreadcrumbs(context.breadcrumbs, context.breadcrumbsMap, className)
  };
};

export default function GlobalRoutingProvider ({
  breadcrumbsMap,
  onGlobalNavigation,
  lockUnsavedChanges = false,
  browserPromptText = "",
  useBrowserPrompt = false
}: PropsWithChildren<GlobalRoutingContextProps>) {
  /* @NOTE: Using the `useUnsavedChangesLock()` ReactJS hook */
  const { getUserConfirmation } = useUnsavedChangesLock({
    useBrowserPrompt,
  });

  /* @NOTE: Using the `useRoutingMonitor()` ReactJS hook */
  const { getBreadCrumbsList } = useRoutingMonitor({
    promptMessage: browserPromptText,
    getUserConfirmation: lockUnsavedChanges ? getUserConfirmation : (() => false),
    /* onNavigation() gets called each time the route changes */
    onNavigation: (
      history,
      { previousPathname, currentPathname, navigationDirection }
    ) => {
      /* Can setup Hotjar Events API, Segment or Rudderstack analytics here */
      if (typeof onGlobalNavigation === 'function') {
        onGlobalNavigation({
          previousPathname,
          currentPathname,
          navigationDirection,
          history
        });
      }
    },
  });

  const location: Location = useLocation();
  const value = useMemo(() => {
    return {
      breadcrumbs: getBreadCrumbList(location.pathname), 
      breadcrumbsMap
    };
  }, [location.key]);

  return (
    <GlobalRoutingContext.Provider value={value}>
      <Router
        getUserConfirmation={
          lockUnsavedChanges ? getUserConfirmation : undefined
        }
      >
        {children}
      </Router>
    </GlobalRoutingContext.Provider>
  );
}
