import React from "react";
import { VehicleParts } from "../../components/UI_Regions/VehicleParts/index";

import type { UseQueryResult } from "@tanstack/react-query";

const Vehicles = (injected: { queries: Record<("vehicles" | string & {}), UseQueryResult | null> } | undefined) => {
  if (!injected || !injected.queries) {
    return null;
  }
  return (<section>
    <h1>{"Vehicles"}</h1>
    <VehicleParts queries={{ vehicleParts: [] }} />
    </section>);
};

export default Vehicles;
