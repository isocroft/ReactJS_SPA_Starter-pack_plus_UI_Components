import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

  [data, setState, clearState];
}
