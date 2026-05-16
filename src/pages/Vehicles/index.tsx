import React from "react";
import VehicleParts from "../../components/UI_Regions/VehicleParts/index";

import type { UseQueryResult } from "@tanstack/react-query";
import type { Vehicle } from "../../components/UI_Regions/VehicleParts/index";

const Vehicles = (
  injected:
    | {
        queries: Record<
          string,
          UseQueryResult<Array<Vehicle | undefined>, Error> | null
        >;
      }
    | undefined
) => {
  if (!injected || !injected.queries) {
    return null;
  }
  return (
    <section>
      <h1>{"Vehicles"}</h1>
      <VehicleParts queries={injected.queries} />
    </section>
  );
};

export default Vehicles;
