import { useEffect } from "react";
import { FeaturesToggleContext } from "../shared/providers/FeaturesToggleProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type FeatureToggleHandlers = {
  isDisabledFor: (feature: string) => boolean,
  isEnabledFor: (feature: string) => boolean
};

const murmurhash = () => {
  /* @TODO: To be implemented soon */
};

const MAX_UNSIGNED_INT_32 = 4_294_967_295;

export const useFeatureToggle = (user: Record<string, unknown>) => {
  const features = useContext(FeaturesToggleContext);
  const userIdentifierTag = features.authOwnerOptions["[identifier]"];
  const userAccessControlTag = features.authOwnerOptions["[access_control]"];

  const flagId = user[userIdentifierTag] as string;
  const flagAccessType = user[userAccessControlTag] as string;

  return {
    isDisabledFor: (feature: string) => {
      if (typeof feature !== "string") {
        return true;
      }
  
      const featureDetails = features.enabledFeatures.find((enabledFeature) => {
        return enabledFeature.startsWith(feature.toLowerCase())
      }) || "_";

      return featureDetails === "_";
    },
    isEnabledFor: (feature: string, segments?: string[] = []) => {
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
