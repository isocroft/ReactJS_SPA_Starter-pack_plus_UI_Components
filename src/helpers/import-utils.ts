import type { UseQueryResult } from "@tanstack/react-query";
import { lazy } from "react";
/* @ts-ignore */
import type { JSX } from "react";

/**
 * lazyWithRetry:
 *
 * @CHECK: https://gist.github.com/raphael-leger/4d703dea6c845788ff9eb36142374bdb#file-lazywithretry-js
 *
 * @param {( => Promise<*>} componentImport
 
 * @returns {}
 */
export const lazyWithRetry = <
  Props extends {
    query: UseQueryResult | null;
  }
>(
  componentImport: () => Promise<{
    default: (props?: Props) => JSX.Element | null;
  }>,
  retryStorageKey = "page-has-been-force-refreshed"
) => {
  return lazy<React.ComponentType<Props | undefined>>(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem(retryStorageKey) || "false"
    ) as boolean;

    try {
      const component = await componentImport();

      window.sessionStorage.setItem(retryStorageKey, "false");

      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        function onBeforeUnload (e) {
          e.preventDefault();
          if (e.returnValue) {
            e.returnValue = undefined;
          }
          window.removeEventListener("beforeunload", onBeforeUnload);
          window.sessionStorage.removeItem(retryStorageKey);
        };
        /* @HINT: Assuming that the user is not on the latest version of the application. */
        /* @HINT: Let's refresh the page immediately. */
        window.sessionStorage.setItem(retryStorageKey, "true");
        window.addddEventListener("beforeunload", onBeforeUnload);
        window.location.reload();
      } else {
        /* @HINT: If we get here, it means the page has already been reloaded */
        /* @HINT: Assuming that user is already using the latest version of the application. */
        /* @HINT: Let's let the application crash and raise the error. */
        throw error;
      }
      return { default: () => null };
    }
  });
};

/**
 * componentLoader:
 *
 * @CHECK: https://medium.com/@botfather/react-loading-chunk-failed-error-88d0bb75b406
 *
 * @param {} lazyComponent
 * @param {Number} attemptsLeft
 *
 * @returns {Promise<*>}
 */
export function componentLoader<
  M extends {
    default: (injected?: {
      query: UseQueryResult | null;
    }) => JSX.Element | null;
  }
>(lazyComponent: () => Promise<M>, attemptsLeft = 3) {
  return new Promise<M>((resolve, reject) => {
    lazyComponent()
      .then(resolve)
      .catch((error) => {
        /* @HINT: let us retry after 1500 milliseconds */
        window.setTimeout(() => {
          if (attemptsLeft === 1) {
            reject(error);
            return;
          }
          componentLoader(lazyComponent, attemptsLeft - 1).then(
            resolve,
            reject
          );
        }, 1500);
      });
  });
}
