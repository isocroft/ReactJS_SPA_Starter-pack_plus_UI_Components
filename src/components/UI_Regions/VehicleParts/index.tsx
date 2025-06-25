import React from "react";
import type { UseQueryResult } from "@tanstack/react-query";

const VehicleParts = (queries: Record<"vehicleParts", UseQueryResult>) => {
  if (!queries || !queries.vehicleParts) {
    return null;
  }

  return (<>
    <h1>{"Vehicles Parts"}</h1>
    <ul>{queries.vehicleParts.data.map((datum) => {
      return (<li>{datum.partId} - {datum.make}</li>)
    })}</ul>
  </>);
};

export default VehicleParts;
