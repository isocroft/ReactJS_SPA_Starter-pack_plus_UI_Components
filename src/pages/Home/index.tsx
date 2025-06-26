import React from "react";
import type { UseQueryResult } from "@tanstack/react-query";

const Home = (injected: { queries: Record<("home" | string & {}), UseQueryResult | null> } | undefined) => {
  if (!injected || !injected.queries) {
    return null;
  }

  return <h1>Home</h1>;
};

export default Home;
