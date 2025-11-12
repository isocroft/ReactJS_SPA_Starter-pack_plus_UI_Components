import React, { useRef, useMemo, useContext, useState, useEffect } from "react";
import { useIsDOMElementVisibleOnScreen, useEffectMemo, useEffectCallback } from "react-busser";
import { toast, useSonner } from "sonner";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import moment from "moment";

import { FeaturesToggleContext } from "../shared/providers/FeaturesToggleProvider";

import type { ToastT } from "sonner";
import type {
  InfiniteQueryResult,
  InfiniteQueryKey,
  InfiniteQueryFunction,
  InfiniteQueryOptions,
  InvalidateQueryFilters,
  UseMutationOptions,
  UseQueryOptions,
  QueryKey
} from "@tanstack/react-query";

export type FeatureToggleHandlers = {
  isDisabledFor: (feature: string) => boolean,
  isEnabledFor: (feature: string, segments?: string[]) => boolean
};

export type InfiniteScrollQueryOptions<TK, TR, TMV, TE> = {
  queryKey: InfiniteQueryKey<TK>;
  queryFn?: InfiniteQueryFunction<TR, TK, TMV>;
  config?: InfiniteQueryOptions<TR, TMV, TE>;
};

type TypeSafeQueryKey<TQueryFnData> = UseQueryOptions<TQueryFnData>["queryKey"];
type TypeSafeMutationKey = NonNullable<UseMutationOptions["mutationKey"]>;

interface OptimisticProps<
    TData = unknown,
    TError = unknown,
    TVariables = void,
    TQueryFnData = unknown
> extends Omit<UseMutationOptions<TData, TError, TVariables, () => void>, "onError" | "onMutate" | "onSettled"> {
    /**
     * @NOTE:
     * 
     * The mutation context is omitted in the params here 
     * because rollback of data snapshot is done
     * automatically in the error callback.
     */
    onError?: (variables: TVariables, error: TError) => void;
    queryKey: TypeSafeQueryKey<TQueryFnData>;
    updaterFn?: (variables: TVariables, input: TQueryFnData | undefined) => TQueryFnData | undefined;
    noRerenderOnWrite?: boolean;
    queryCacheData?: TQueryFnData | undefined;
    invalidates?: QueryKey;
}

type ReactQueryCacheOptions<TQFnData> = {
  noRenderOnWrite?: boolean,
  queryKey: TypeSafeQueryKey<TQFnData>
};

const murmurhash = () => {
  /* @TODO: To be implemented... */
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
    ref.current.length !== 0 && list.length === ref.current.length
      ? list.every((element, index) => {
        return element === ref.current[index];
      })
      : false;

  // latest ref pattern
  useEffect(() => {
    //only update prev results if array is not deemed the same
    if (!areArraysConsideredTheSame) {
      ref.current = list;
    }
  });

  return (areArraysConsideredTheSame ? ref.current : list) as const;
}

export function useMemoList<L extends unknown[]>(list: L, callback = (() => undefined)) {
  const cachedList = useArrayCache(list);
  return useMemo(callback.bind(null, cachedList), [cachedList]);
}

export const useOptimisticMutation = <
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TQueryFnData = unknown
>({
  queryKey,
  updaterFn,
  invalidates,
  onError,
  mutationKey,
  queryCacheData = undefined,
  noRerenderOnWrite = false,
  ...props
}): OptimisticProps<TData, TError, TVariables, TQueryFnData> => {
  const {
     updateQueryCacheData,
     forceUpdateQueryCacheData,
     invalidateQueryCache,
     cancelOngoingQueries,
     isCurrentlyMutating,
     getDataFromCache,
   } = useReactQueryCache<TQueryFnData, TError>(
    { noRenderOnWrite:  noRerenderOnWrite, queryKey },
    queryCacheData
  );
  
  const computedMutationKey = useEffectMemo(() => ([...queryKey, ...(mutationKey ?? [])]),
    [mutationKey, queryKey]
  );
    
  return useMutation({
    ...props,
    mutationKey: computedMutationKey,
    onMutate: async (variables) => {
      await cancelOngoingQueries(queryKey);
       
      const snapshotResult = fetchQueryCacheData(queryKey);

      updateQueryCacheData(queryKey, (oldData) => {
        return typeof updaterFn === "function"
           ? updaterFn(variables, oldData)
           :  getDataFromCache(queryKey);
      });

      return () => {
        if (!noRerenderOnWrite) {
           forceUpdateQueryCacheData(queryKey, snapshotResult);
        }
      };
    },
    onError: (error, variables, rollback = (() => undefined)) => {
      rollback();
      
      if (typeof onError === "function") {
        onError(variables, error);
      }
    },
    onSettled: async () => {
      if (invalidates) {
        if (isCurrentlyMutating(queryKey) === 1) {
          await invalidateQueryCache(invalidates);
        }
      }
    }
  });
};

export function useInfiniteScrollForQueries  <K, D, T, E = Error>(
  queryOptions: InfiniteScrollQueryOptions<K, D, T, E>,
  scrollOptions = { rootMargin: "0px", threshold: 1 }
) {
  const { fetchNextPage, hasNextPage, ...query } = useInfiniteQuery(queryOptions);
  const [ isIntersecting, domElementRef ] = useIsDOMElementVisibleOnScreen(scrollOptions);

  const fetcher = useEffectCallback(fetchNextPage, { immutableRef: true });
       
  useEffect(() => {
    if (isIntersecting && hasNextPage) {
      fetcher();
    }
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [isIntersecting, hasNextPage]);

  const queryResult = { ...query, hasNextPage, fetchNextPage } as InfiniteQueryResult<D, T, E>;

  return [queryResult, domElementRef] as const;
}

export const useFeatureToggle = <R = Record<string, unknown>>(user: R) => {
  const features = useContext(FeaturesToggleContext);

  const userIdentifierTag = features.authOwnerOptions["[identifier]"];
  const userAccessControlTag = features.authOwnerOptions["[access_control]"];
  const userRecord = user || { [userIdentifierTag]: "", [userAccessControlTag]: "" };

  const flagId = userRecord[userIdentifierTag] as string;
  const flagAccessType = userRecord[userAccessControlTag] as string;

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
      if (typeof feature !== "string" || !Array.isArray(segments)) {
        return false;
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
            const optionValueNormalized = optionValue.substring(1, optionValue.length-1).trim();
            if (optionValueNormalized.length === 0) {
              return false
            }
            return (optionValueNormalized.split(',')).includes(flagAccessType);
            break;
          case "segments":
            const optionValueNormalized = optionValue.substring(1, optionValue.length-1).trim();
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
              return false;
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

export const useCurrentTime = (formatting = 'hh:mm A', intervalDuration = (1000 * 60)) => {
  const [currentTime, setCurrentTime] = useState(() => moment().format(formatting))

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(moment().format(formatting))
    }

    let interval = null;

    if (interval === null) {
      /* @HINT: Update time immediately on mount */
      updateTime();
    }

    /* @NOTE: Default is to update the time every minute */
    interval = setInterval(updateTime, intervalDuration)

    return () => {
      clearInterval(interval);
    }
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [formatting, intervalDuration])

  return currentTime;
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

export function useObserveDOMMutations (
  callback = (() => undefined),
  options = {
    childList: true,
    subtree: true,
    attributes: false,
    attributeFilter: [],
    attributeOldValue: false,
    characterData: false,
    characterOldValue: false
  },
  rootElementId = '#root'
) {
  const [observer] = useState(() => (typeof window !== "undefined" ? new MutationObserver(function (mutations, instance) {
    const reactAppRootElem = window.document.querySelector(rootElementId);
    
    if (!reactAppRootElem) {
      instance.disconnect();
      return;
    }

    callback(mutations);
  }) : {}));

  useEffect(() => {
    function onPageIsInteractive() {
      if (window.document.readyState === "interactive"
          || window.document.readyState === "complete") {
        observer.observe(
          window.document,
          options.attributes === false
            /* @HINT: Ensure that the mutation observer doesn't throw an error/exception */
            /* @CHECK: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#exceptions */
            ? Object.assign({ attributeFilter: undefined }, options)
            : options
        );
      }
    }

    window.document.addEventListener("readystatechange", onPageIsInteractive, false);

    return () => {
      let mutations = typeof observer.takeRecords === "function"
        ? observer.takeRecords()
        : [];

      observer.disconnect();

      if (mutations.length > 0) {
        callback(mutations);
      }

      window.document.removeEventListener("readystatechange", onPageIsInteractive, false);
    };
  }, []);
}

export const useScrollPosition = <T extends HTMLElement>(
  ref?: React.MutableRefObject<T>
) => {
  const [scrollPosition, setScrollPosition] = useState<[number, number]>([0, 0]);
  
  useEffect(() => {
    if (!ref || !ref.current) {
      return;
    }

    const targetElement = ref ? ref.current : window;
    const handleScroll = () => {
      const currentScrollPosition: [number, number] = ref ?
      [ref.current.scrollTop, ref.current.scrollLeft] :
      [window.scrollX, window.scrollY]; 
      setScrollPosition(currentScrollPosition)
    };

    handleScroll();

    targetElement.addEventListener("scroll", handleScroll, false);
    return () => {
      targetElement.removeEventListener("scroll", handleScroll, false);
    };
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  return scrollPosition as const;
};

export function useReactQueryCache<D = unknown, E = unknown>({ noRenderOnWrite = false, queryKey } = { queryKey: [] } as ReactQueryCacheOptions<D>, initial: D | undefined) {
  let queryKeysCache = useRef<Map<string, TypeSafeQueryKey<D>>>(new Map()).current;
  let queryNoRerenderCache = useRef<WeakMap<object & {}, D>>(new WeakMap()).current;
  const queryClient = useQueryClient();
  const queryCache = queryClient.getQueryCache();
  
  useEffect(() => {
    return () => {
      /* @ts-ignore */
      queryKeysCache = null;
      /* @ts-ignore */
      queryNoRerenderCache = null;
    };
  }, []);

  if (typeof queryKey !== "object") {
    throw new Error("`queryKey` missing for `useReactQueryCache(..)` hook");
  }

  if (initial) {
    const noRenderCacheData = queryNoRerenderCache.get(queryKey) || undefined;

    if (!noRenderCacheData) {
      queryNoRerenderCache.set(queryKey, initial);
      queryKeysCache.set(String(queryKey), queryKey);
    }
  }

  return {
    fetchQueryCacheData (queryKey: NonNullable<TypeSafeQueryKey<D>>): D | undefined {
      let queryKeyRef: TypeSafeQueryKey<D> = undefined;

      if (noRenderOnWrite) {
        queryKeyRef = queryKeysCache.get(String(queryKey));
      }

      if (!queryKeyRef || typeof queryKeyRef !== "object") {
        return undefined;
      }
 
      return noRenderOnWrite
        ? queryNoRerenderCache.get(queryKeyRef)
        : queryClient.getQueryData(queryKey) as D;
    },
    cancelOngoingQueries (queryKey: TypeSafeQueryKey<D>): Promise<void> {
      if (typeof queryKey !== "object") {
        return Promise.reject(undefined);
      }

      return queryClient.cancelQueries({ queryKey });
    },
    isCurrentlyMutating (mutationKey: TypeSafeMutationKey): number {
      return typeof queryClient.isMutating === "function"
        ? queryClient.isMutating({ mutationKey })
        : 0
    },
    isCurrentlyFetching (queryKey: TypeSafeQueryKey<D>): number {
      if (typeof queryKey !== "object") {
        return -1;
      }

      return typeof queryClient.isFetching === "function"
        ? queryClient.isFetching({ queryKey })
        : 0
    },
    updateQueryCacheData (queryKey: NonNullable<TypeSafeQueryKey<D>>, callback = ((oldData: D | undefined) => oldData)): D | undefined {
      if (typeof callback !== "function" || typeof queryKey !== "object") {
        return undefined;
      }

      return noRenderOnWrite
        ? queryNoRerenderCache.set(
            queryKey,
            callback(queryNoRerenderCache.get(queryKey)) as NonNullable<D>
          ) &&
          queryKeysCache.set(String(queryKey), queryKey) &&
          queryNoRerenderCache.get(queryKey)
        : queryClient.setQueryData(queryKey, callback as ((oldData: D | undefined) => NonNullable<D>));
    },
    forceUpdateQueryCacheData (queryKey: NonNullable<TypeSafeQueryKey<D>>, data: D): D {
      if (typeof queryKey !== "object") {
        return data;
      }

      return queryClient.setQueryData(queryKey, data);
    },
    invalidateQueryCache (queryKey: TypeSafeQueryKey<D>, exact = false): Promise<void> {
      if (typeof queryKey !== "object") {
        return Promise.reject(undefined);
      }

      return queryClient.invalidateQueries({ queryKey, exact });
    },
    invalidateQueryCacheWithPredicate (predicate: InvalidateQueryFilters["predicate"]): Promise<void> {
      return queryClient.invalidateQueries({ predicate });
    },
    getDataFromCache (queryKey: NonNullable<TypeSafeQueryKey<D>>): D | undefined {
      if (typeof queryKey !== "object") {
        return undefined;
      }

      if (!noRenderOnWrite) {
        const query = queryCache.find<D, E>(queryKey);
        return query?.state?.data || initial;
      }
      
      const noRenderCacheData = queryNoRerenderCache.get(queryKey) || undefined;
      return noRenderCacheData;
    }
  } as const
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
