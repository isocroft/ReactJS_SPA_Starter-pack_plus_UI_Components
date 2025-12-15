import React, { Component } from "react";
// import { useSearchParamStateValueUpdate } from "react-busser";
import { withRouter } from "react-router";

// import Bugsnag from "@bugsnag/js"; // v7.13.2
// import BugsnagPluginReact, { BugsnagErrorBoundary } from "@bugsnag/plugin-react"; // v7.13.2
// import config from "../config";
// import { envProduction } from "../constants";

// import packageInfo from '../../package.json';

/*
if (config.PROD) {
  Bugsnag.setUser(
    id,
    merchantUser.email,
    `${merchantUser.first_name} ${merchantUser.last_name}`
  );

  Bugsnag.addMetadata("user_info", {
    email: merchantUser.email,
    phone_number: merchantUser.phone_number,
    logged_in_at: merchantUser.last_login
  });
}
*/

import type { ComponentType, ErrorInfo, ReactNode, FunctionComponent } from "react";
import type { RouteComponentProps } from "react-router";
import type { Location } from "history";

// interface CustomWithRouterProps {
//   location: Location;
//   changeParam: ReturnType<typeof useSearchParamStateValueUpdate>;
// }

type OnErrorCallback = (event: Event, cb: (err: null | Error, shouldSend?: boolean) => void) => void | boolean | Promise<void | boolean>;

export type ErrorFallbackUIProps = { error: Error, location: Location, resetErrorBoundary?: (...args: any[]) => void };

interface ErrorBoundaryProps extends RouteComponentProps {
  onError?: OnErrorCallback;
  FallbackComponent?: ComponentType<{
    error: Error
    info: ErrorInfo
    clearError: () => void
  }>;
  FallbackUI?: FunctionComponent<ErrorFallbackUIProps>;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// @NOTE: React-Router v7.x.x doesn't support `withRouter(...)` since it's been deprecated and removed as from v6.x.x
// @CHECK: https://stackoverflow.com/a/71097818
// export function withRouter<ComponentProps>(Component: ComponentType<ComponentProps>) {
//     function ComponentWithRouterProp(props: Omit<Readonly<ComponentProps & CustomWithRouterProps>, keyof CustomWithRouterProps>) {
//         const location = useLocation();
//         const changeSearchParam = useSearchParamStateValueUpdate("errorMessage");

//         return <Component {...props as ComponentProps} location={location} changeParam={changeSearchParam} />;
//     }

//     return ComponentWithRouterProp;
// }

const DEV_ENV = process.env.;
const PROD_ENV = import.meta.env.PROD;

class ErrorBoundaryComponent extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Example "componentStack":
    //   in ComponentThatThrows (created by App)
    //   in ErrorBoundary (created by App)
    //   in div (created by App)
    //   in App
    if (DEV_ENV) {
        console.error(
            "Uncaught error:",
            error, // error.message, error.stack
            info // info.componentStack
        );
    } else if (PROD_ENV) {
        // @TODO: Replace this `console.info('.')` line with error reporting logic.
        // @FIXME: Use [TrackJS], [Sentry] or [BugSnag] 
        console.info('.');
    }
  }

  resetErrorBoundary() {
    this.setState({ hasError: false, error: null });
    if (DEV_ENV) {
        console.info("Error Boundary reset.");
    }
  }

  componentDidUpdate (prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    if (prevProps && prevProps.location.key !== this.props.location.key) {
      if (prevState.hasError === true) {
        this.setState({ hasError: false})
      }
      return;
    }

    if (this.state.hasError && this.state.error !== null) {
      switch (this.state.error.message) {  
        case "Invalid Permissions":
          this.props.history.replace(`${window.location.pathname}?errorMessage=Invalid%20Permissions`);
        break;
      }
    }  
  }  

  render() {
    if (this.state.hasError && this.state.error !== null) {
      const { FallbackUI } = this.props;
      // Render any custom Fallback UI
      return FallbackUI ? <FallbackUI error={this.state.error} location={this.props.location} /> : <p>Error: {this.state.error?.message}</p>;
    }

    return this.props.children;
  }
}

/*
if (config.PROD) {
  const ignorePatterns = [
    "ResizeObserver loop limit exceeded",
    "Can't find variable: ResizeObserver"
  ];
  
  Bugsnag.start({
    collectUserIp: true,
    apiKey: config.BUGSNAG.apiKey || "",
    appVersion: packageInfo.version,
    appType: "client",
    enabledErrorTypes: {
      unhandledRejections: true
    },
    autoCaptureSessions: false,
    plugins: [new BugsnagPluginReact()],
    enabledReleaseStages: [envProduction],
    releaseStage: envProduction,
    logger: null, // switch off logging
    maxBreadcrumbs: 40,
    featureFlags: [],
    maxEvents: 30,
    onError: event => {
      const user = event.getUser();
      const id = (user || { id: "" }).id;
      if (!id) {
        const userId = window.Cookies.get("app_user_id");
        if (userId) {
          event.setUser(userId);
        }
      }
  
      if (ignorePatterns.some(pattern => pattern.includes(event.errors[0].errorMessage))) {
        return false;
      }
    }
  });
  Bugsnag.leaveBreadcrumb("[App.tsx]: App starting…");
}

const ErrorBoundary = config.PROD
  ? Bugsnag.getPlugin("react")?.createErrorBoundary(React) ?? withRouter(ErrorBoundaryComponent)
  : withRouter(ErrorBoundaryComponent);

export default ErrorBoundary;
*/

const ErrorBoundary = withRouter(ErrorBoundaryComponent);

export default ErrorBoundary;
