import React, { createContext } from "react";

export type FeatureFlagEnvs = "development" | "production" | "test";

type FeatureEnvsTable = {
  "development": string[],
  "test": string[],
  "production": string[]
};

export const FeaturesToggleContext = createContext({
  enabledFeatures: [] as string[]
});

function FeaturesToggleProvider ({
  children,
  environment,
  enabledFeaturesTable
}: {
  children: React.ReactNode,
  environment: FeatureFlagEnvs,
  enabledFeaturesTable: FeatureEnvsTable,
  authUserOptions: { "[identifier]": string, "[access_control]": string }
}) {
  return (
    <FeaturesToggleContext.Provider value={{ enabledFeatures: enabledFeaturesTable[environment], authUserOptions }}>
      {children}
    </FeaturesToggleContext.Provider>
  );
};

export default FeaturesToggleProvider;
