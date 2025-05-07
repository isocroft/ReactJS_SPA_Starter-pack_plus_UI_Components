import { createContext, useContext, useMemo, PropsWithChildren } from "react";
import {
  BrowserRouter as Router,
} from "react-router-dom";
import { useRoutingMonitor, useUnsavedChangesLock } from "react-busser";

import type { StaticContext, RouteComponentProps } from "react-router";

import { renderBreadcrumbs } from "../helpers/render-utils";

export type GlobalRoutingContextProps = {
  lockUnsavedChanges?: boolean,
  useBrowserPrompt?: boolean,
  browserPromptText?: string
};

const GlobalRoutingContext = createContext<{ browserPromptText: string, getUserConfirmation: () => boolean }>(
  { browserPromptText: "Are you sure?", getUserConfirmation: () => false }
);

export const useRoutingBreadCrumbsData = (breadcrumbsMap: Record<string, string>, { onNavigation }: {
  onNavigation?: (options: Pick<RouteComponentProps<{}, StaticContext, object>, "history"> & {
    previousPathname: string,
    currentPathname: string,
    navigationDirection: 'refreshnavigation' | 'backwardnavigation' | 'forwardnavigation'
  }) => void;
}) => {
  const context = useContext(GlobalRoutingContext);
  
  if (!context) {
    throw new Error("This hook requires the <GlobalRoutingProvider/> to be installed");
  }

  /* @NOTE: Using the `useRoutingMonitor()` ReactJS hook */
  const { navigationList, getBreadCrumbsList, currentLocation } = useRoutingMonitor({
    promptMessage: context.browserPromptText,
    getUserConfirmation: context.getUserConfirmation,
    /* onNavigation() gets called each time the route changes */
    onNavigation: (
      history,
      { previousPathname, currentPathname, navigationDirection }
    ) => {
      /* Can setup Hotjar Events API, Segment or Rudderstack analytics here */
      if (typeof onNavigation === 'function') {
        onNavigation({
          previousPathname,
          currentPathname,
          navigationDirection,
          history
        });
      }
    },
  });

  return ({ className }) => {
    return renderBreadcrumbs(getBreadCrumbsList(), breadcrumbsMap, className, currentLocation);
  };
};

export default function GlobalRoutingProvider ({
  lockUnsavedChanges = false,
  browserPromptText = "Are you sure?",
  useBrowserPrompt = true
}: PropsWithChildren<GlobalRoutingContextProps>) {
  /* @NOTE: Using the `useUnsavedChangesLock()` ReactJS hook */
  const { getUserConfirmation/* allowTranstion, blockTransition */ } = useUnsavedChangesLock({
    useBrowserPrompt,
  });

  return (
    <GlobalRoutingContext.Provider value={{ browserPromptText, getUserConfirmation: lockUnsavedChanges ? getUserConfirmation : (() => false) }}>
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
