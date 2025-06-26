import React, { useRef, useMemo, useContext, useEffect } from "react";
import { toast, useSonner } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { FeaturesToggleContext } from "../shared/providers/FeaturesToggleProvider";

import type { ToastT } from "sonner";

type FeatureToggleHandlers = {
  isDisabledFor: (feature: string) => boolean,
  isEnabledFor: (feature: string, segments?: string[]) => boolean
};

const murmurhash = () => {
  /* @TODO: To be implemented soon */
};

const MAX_UNSIGNED_INT_32 = 4_294_967_295;

export const useToastManager = ({
  timeout = Infinity,
  className = "",
}: {
  timeout?: number;
  className?: string;
}) => {
  const { toasts } = useSonner();

  useEffect(() => {
    function removeAllToasts() {
      toasts.forEach(($toast: ToastT) => toast.dismiss($toast.id));
    }

    return () => {
      removeAllToasts();
    };
  }, [toasts.length]);

  return {
    showToast({
      cancel,
      title,
      description = "",
      icon,
      action,
      position,
      onClose,
    }: {
      title: string | React.FunctionComponent<{}>;
      description?: string | React.FunctionComponent<{}>;
      cancel?: React.ReactNode;
      icon?: React.ReactNode;
      action?: React.ReactNode;
      onClose?: (t: ToastT) => void;
      position?:
        | "top-center"
        | "top-left"
        | "top-right"
        | "bottom-center"
        | "bottom-left"
        | "bottom-right";
    }) {
      return toast(
        title,
        Object.assign(
          {
            position: "bottom-right" as const,
          },
          {
            className,
            description,
            duration: timeout,
            onAutoClose: onClose,
            icon,
            cancel,
            action,
          }
        )
      );
    },
  };
};

export function useArrayCache<A extends unknown[]>(list: A) {
  // this holds reference to previous value 
  const ref = useRef([]);
  // check if each element of the old and new array match
  const areArraysConsideredTheSame =
    ref.length !== 0 && list.length === ref.current.length
      ? list.every((element, index) => {
        return element === ref.current[index];
      })
    //initially there's no old array defined/stored, so set to false
    : false;

  useEffect(() => {
    //only update prev results if array is not deemed the same
    if (!areArraysConsideredTheSame) {
      ref.current = list;
    }
  }, [areArraysConsideredTheSame, list]);

  return (areArraysConsideredTheSame ? ref.current : list) as const;
}

export function useArrayMemo<L extends unknown[]>(list: L, callback = (() => undefined)) {
  const cachedList = useArrayCache(list);
  return useMemo(callback, [cachedList]);
}

export const useFeatureToggle = (user: Record<string, unknown>) => {
  const features = useContext(FeaturesToggleContext);
  const userIdentifierTag = features.authOwnerOptions["[identifier]"];
  const userAccessControlTag = features.authOwnerOptions["[access_control]"];

  const flagId = user[userIdentifierTag] as string;
  const flagAccessType = user[userAccessControlTag] as string;

  return {
    getAllEnabledFeatures () {
      return features.enabledFeatures.slice(0);
    },
    isDisabledFor (feature: string) {
      if (typeof feature !== "string") {
        return true;
      }
  
      const featureDetails = features.enabledFeatures.find((enabledFeature) => {
        return enabledFeature.startsWith(feature.toLowerCase())
      }) || "_";

      return featureDetails === "_";
    },
    isEnabledFor (feature: string, segments?: string[] = []) {
      if (typeof feature !== "string") {
        return false
      }

      const featureDetails = features.enabledFeatures.find((enabledFeature) => {
        return enabledFeature.startsWith(feature.toLowerCase())
      }) || "_";

      if (featureDetails === "_") {
        return false
      }

      const [, optionsString] = featureDetails.split("|");

      if (typeof optionsString === "undefined") {
        return true;
      }

      const optionsList = optionsString.split(";");

      return optionsList.some((option) => {
        const [optionName, optionValue] = option.split("=");

        switch (optionName) {
          case "role":
            const optionValueNormalized = optionValue.substring(1,optionValue.length-1).trim();
            if (optionValueNormalized.length === 0) {
              return false
            }
            return (optionValueNormalized.split(',')).includes(flagAccessType);
            break;
          case "segments":
            const optionValueNormalized = optionValue.substring(1,optionValue.length-1).trim();
            if (optionValueNormalized.length === 0) {
              return false
            }
            return segments.length === 0 ? optionValueNormalized === '*' : segments.every((segment) => {
              const allowedSegements = optionValueNormalized.split(',');
              return allowedSegments.includes(segment);
            });
            break;
          case "qualifier":
            const allowedPercentage = Number(optionValue);
            
            if (Number.isNaN(percentage)) {
              return false
            }

            return murmurhash(`${feature.toUpperCase()}-${flagId}`) / MAX_UNSIGNED_INT_32 < allowedPercentage
            break;
          default:
            return false
            break;
        }
      })
    }
  } as FeatureToggleHandlers;
};

export const useMutationObserver = (
  ref,
  callback,
  options = {
    attributes: true,
    characterData: false,
    childList: false,
    subtree: false,
  }
) => {
  useEffect(() => {
    let observer = null;
    if (ref.current) {
      observer = new window.MutationObserver(callback);
      observer.observe(ref.current, options);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);
};

export function useReactQueryCache<D, E>(queryKey: unknown[] = []) {
  const queryClient = useQueryClient();

  const queryCache = queryClient.getQueryCache();
  return queryCache.find<D, E>(queryKey);
}

/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/use-callback-ref/src/useCallbackRef.tsx
 */

/**
 * A custom hook that converts a callback to a ref to avoid triggering re-renders when passed as a
 * prop or avoid re-executing effects when passed as a dependency
 */
export function useCallbackRef<T extends (...args: never[]) => unknown>(
  callback: T | undefined
): T {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  })

  // https://github.com/facebook/react/issues/19240
  return useMemo(
    () => ((...args) => callbackRef.current?.(...args)) as T,
    []
  )
}

export function useGlobalState<D = unknown>(key: string | string[], value: D) {
  const queryClient = useQueryClient();
  const $queryKey = Array.isArray(key) ? ["USER_Q", ...key] : ["USER_Q", key];

  const { data } = useQuery({
    queryKey: [],
    queryFn: () => Promise.resolve(value),
    initialData: value,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    reftechOnReconnect: false,
    reftechIntervalInBackground: false,
  });

  const setState = <D extends Record<string, unknown>>(
    stateOrFunction: D | Function
  ) => {
    queryClient.setQueryData($queryKey, () => {
      return typeof stateOrFunction === "function"
        ? stateOrFunction(data)
        : stateOrFunction;
    });
  };

  const clearState = ($key: string | string[]) => {
    const _queryKey = Array.isArray($key)
      ? ["USER_Q", ...$key]
      : ["USER_Q", $key];
    queryClient.invalidateQueries(_queryKey);
    queryClient.refetchQueries(_queryKey);
  };

  return [data, setState, clearState] as const;
}
