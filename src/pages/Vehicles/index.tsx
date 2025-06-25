import React from "react";
import type { UseQueryResult } from "@tanstack/react-query";

const Vehicles = (injected: { queries: Record<string, UseQueryResult | null> } | undefined) => {
  if (!injected || !injected.queries) {
    return null;
  }
  return <h1>{"Vehicles"}</h1>;
};

export default Vehicles;
