import React from "react";
import type { UseQueryResult } from "@tanstack/react-query";

const Home = (
  injected:
    | {
        queries: Record<
          "home",
          UseQueryResult<Array<{ id: number }>, Error> | null
        >;
      }
    | undefined
) => {
  if (!injected || !injected.queries) {
    return null;
  }

  return (
    <>
      <h1>Home</h1>
      <ul>
        {(injected.queries.home?.data || []).map((datum) => {
          return <li>{datum.id}</li>;
        })}
      </ul>
    </>
  );
};

export default Home;
