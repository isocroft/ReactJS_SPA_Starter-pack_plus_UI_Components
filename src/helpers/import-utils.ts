import type { UseQueryResult } from "@tanstack/react-query";
import { lazy } from "react";
/* @ts-ignore */
import type { JSX } from "react";

/**
 * lazyWithRetry:
 *
 *
 * @param {AsyncFunction<[], { default: () => JSX.Element }>} componentImport
 * @param {String=} retryStorageKey
 *
 * @returns {Object}
 */
export const lazyWithRetry = <
  D extends unknown,
  E extends Error,
  Props = {
    queries: Record<string, UseQueryResult<D, E> | null>;
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

    function onBeforeUnload(e: BeforeUnloadEvent) {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.sessionStorage.removeItem(retryStorageKey);
    }

    try {
      /* @CHECK: https://gist.github.com/raphael-leger/4d703dea6c845788ff9eb36142374bdb#file-lazywithretry-js */
      const component = await componentImport();

      window.sessionStorage.setItem(retryStorageKey, "false");

      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        const $retryStorageKey = window.sessionStorage.getItem(retryStorageKey);
        if ($retryStorageKey !== "false") {
          /* @HINT: Assuming that the user is not on the latest version of the application. */
          /* @HINT: Let's refresh the page immediately. */
          window.sessionStorage.setItem(retryStorageKey, "true");
          window.addEventListener("beforeunload", onBeforeUnload);
          window.location.reload();
        }
      } else {
        /* @HINT: If we get here, it means the page has already been reloaded */
        /* @HINT: Assuming that user is already using the latest version of the application. */
        /* @HINT: Let's let the application crash and raise the error. */
        throw error;
      }

      /* @INFO: Instead of returning an empty JSX component, return a component with indeterminate spinner */
      return { default: () => null };
    }
  });
};

/*!
 * @EXAMPLE:
 *
 * const Settings = lazyWithRetry(() =>
 *   componentLoader(() => import("./pages/Settings/index"))
 * );
 *
 * console.log(Settings); // { default: () => (<section>...</section>) }
 *
 */

/**
 * componentLoader:
 *
 *
 * @param {AsyncFunction<[], { default: () => JSX.Element }>} lazyComponent
 * @param {Number=} attemptsLeft
 *
 * @returns {Promise<*>}
 */
export function componentLoader<
  D extends unknown,
  E extends Error,
  M = {
    default: (injected?: {
      queries: Record<string, UseQueryResult<D, E> | null>;
    }) => JSX.Element | null;
  }
>(lazyComponent: () => Promise<M>, attemptsLeft = 3) {
  return new Promise<M>((resolve, reject) => {
    /* @CHECK: https://medium.com/@botfather/react-loading-chunk-failed-error-88d0bb75b406 */
    lazyComponent()
      .then(resolve)
      .catch((error) => {
        window.setTimeout(() => {
          if (attemptsLeft === 1) {
            reject(error);
            return;
          }
          componentLoader<D, E, M>(lazyComponent, attemptsLeft - 1).then(
            resolve,
            reject
          );
        }, 500);
      });
  });
}

/*!
 * @EXAMPLE:
 *
 * const loaderPromise = componentLoader(() => import("./pages/Settings/index"))
 *
 * console.log(loaderPromise); // Promise{<pending>}
 *
 */
