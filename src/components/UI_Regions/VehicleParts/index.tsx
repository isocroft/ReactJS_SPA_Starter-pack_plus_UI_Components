import React from "react";
import type { UseQueryResult } from "@tanstack/react-query";

const VehicleParts = (injected: { queries: Record<("vehicleParts" | string & {}), UseQueryResult | null> } | undefined) => {
  if (!injected || !injected.queries || !injected.queries.vehicleParts) {
    return null;
  }

  return (<>
    <h1>{"Vehicles Parts"}</h1>
    <ul>{injected.queries.vehicleParts.data.map((datum) => {
      return (<li>{datum.partId} - {datum.make}</li>)
    })}</ul>
  </>);
};

export default VehicleParts;
