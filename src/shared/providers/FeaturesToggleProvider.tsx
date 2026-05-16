import React, {
  createContext,
  useRef,
  useState,
  useEffect,
  useReducer,
} from "react";

export type FeatureFlagEnvs = "development" | "production" | "test";

type FeatureEnvsTable = {
  development: string[];
  test: string[];
  production: string[];
};

export const FeaturesToggleContext = createContext({
  enabledFeatures: [] as string[],
  authUserOptions: {} as { "[identifier]": string; "[access_control]": string },
});

function FeaturesToggleProvider({
  children,
  environment,
  enabledFeaturesTable,
  authUserOptions,
}: {
  children: React.ReactNode;
  environment: FeatureFlagEnvs;
  enabledFeaturesTable: FeatureEnvsTable;
  authUserOptions: { "[identifier]": string; "[access_control]": string };
}) {
  const apiResponse = useRef(enabledFeaturesTable[environment] || []);
  const [, rerender] = useReducer(() => ({}), {});
  /* @INFO: `fetch(...)` is supported in both the browser and in NodeJS an Bun runtimes */
  const [apiResponsePromise] = useState(() =>
    window.fetch("https://live.api.featurelybits.com/get/flags", {
      method: "GET",
    })
  );

  useEffect(() => {
    apiResponsePromise
      .then((response) => {
        if (apiResponse.current.length === 0) {
          /* @TODO: ... */
        }
        return response.json() as Promise<{ data: {} }>;
      })
      .then((json) => {
        apiResponse.current = json.data[environment];
        rerender();
      });
  }, [environment]);

  return (
    <FeaturesToggleContext.Provider
      value={{ enabledFeatures: apiResponse.current, authUserOptions }}
    >
      {children}
    </FeaturesToggleContext.Provider>
  );
}

export default FeaturesToggleProvider;
