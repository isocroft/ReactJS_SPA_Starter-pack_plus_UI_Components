import type { UseQueryResult } from "@tanstack/react-query";

export const useRegionDataLoader = () => {
  /* @HINT: Pretending to be a call to `useQuery()` */
  const query = {
    data: [{ make: "Toyota", partId: 11 }, { make: "Nissan", partId: 6 }],
    isLoading: false,
    isError: false,
    status: 'success',
    refetch: () => Promise.resolve({});
  };

  return { vehicleParts: query } as Record<string, UseQueryResult>;
};
