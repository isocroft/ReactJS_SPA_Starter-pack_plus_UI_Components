import { useQueries } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

export const useRegionDataLoader = ({ vehicleIds }: { vehicleIds: number[] }) => {

  const combinedQueries = useQueries<Array<Array<{ id: number, make: string, partsCount: number }>>({
    queries: vehicleIds.map((id) => ({
      queryKey: ['vehiclePart', id],
      queryFn: () => Promise.resolve([{ id, make: "Toyota", partsCount: Math.floor(Math.random() * 30) }]),
    })),
    combine: (results) => {
      return {
        data: results.flatMap((result) => result.data),
        isPending: results.some((result) => result.isPending),
        isLoading: results.some((result) => result.isLoading),
        error: results.some((result) => result.error !== null) ? new Error("an error occured") : null,
        isFetching: results.some((result) => result.isFetching),
        isSuccess: results.some((result) => result.isSuccess),
        isError: results.some((result) => result.isError),
        status: results.some((result) => result.status === 'error') ? 'error' : 'idle'
        refetch: () => Promise.resolve([]),
        fetchNextPage: () => ({}),
       /* @ts-ignore */
      } as UseQueryResult<Array<{ id: number, make: string, partsCount: number }>, Error>
    },
  })

  return { vehicleParts: combinedQueries } as Record<string, UseQueryResult<Array<{ id: number, make: string }>, Error>>;
};
