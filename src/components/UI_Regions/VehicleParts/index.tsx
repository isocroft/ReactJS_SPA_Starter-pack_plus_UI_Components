import React from "react";
import type { UseQueryResult } from "@tanstack/react-query";

export type Vehicle = { id: number; make: string; partsCount: number };

const VehicleParts = ({
  queries,
}: {
  queries: Record<"vehicleParts", UseQueryResult<Vehicle[], Error>>;
}) => {
  if (!queries || !queries.vehicleParts) {
    return null;
  }

  return (
    <>
      <h1>{"Vehicles Parts"}</h1>
      <ul>
        {queries.vehicleParts.data?.map((datum) => {
          return (
            <li>
              {datum?.partsCount} - {datum?.make}
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default VehicleParts;
