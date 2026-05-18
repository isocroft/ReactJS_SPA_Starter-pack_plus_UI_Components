import { useQueries } from "@tanstack/react-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";

type VehiclePart = {
  id: number;
  make: string;
  partsCount: number;
};
type TQueries = UseQueryOptions<VehiclePart>[];

/* @USAGE: tanstack hook signature for `useQueries` may vary
  based on how you want to use  the  result
*/
/* 
import { useQueries, UseQueryOptions } from '@tanstack/react-query'      
      
const result = useQueries<Array<string>>({
  queries: [
    {
      queryKey: ['key1'],
      queryFn: () => 'string',
    },
  ],
})

result // type='UseQueryResult<unknown, Error>[]'

// Current solution
type TQueries = UseQueryOptions<string>[]
const arrayResult = useQueries<TQueries>({
  queries: [
    {
      queryKey: ['key1'],
      queryFn: () => 'string',
    },
  ],
}) 

arrayResult // type='(DefinedUseQueryResult<string, Error> | QueryObserverLoadingErrorResult<string, Error> | QueryObserverLoadingResult<string, Error> | QueryObserverPendingResult<string, Error> | QueryObserverPlaceholderResult<string, Error>)[]'
*/

export const useRegionDataLoader = ({
  vehicleIds,
}: {
  vehicleIds: number[];
}) => {
  const combinedQueries = useQueries({
    queries: vehicleIds.map((id) => ({
      queryKey: ["vehiclePart", id] as const,
      queryFn: () =>
        Promise.resolve({
          id,
          make: "Toyota",
          partsCount: Math.floor(Math.random() * 30),
        }),
    })),
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
        isPending: results.some((result) => result.isPending) as false,
        isLoading: results.some((result) => result.isLoading) as false,
        error: results.some((result) => result.error === null) ? null : null,
        isFetching: results.some((result) => result.isFetching) as false,
        isSuccess: results.some((result) => result.isSuccess) as true,
        isError: results.some((result) => result.isError) as false,
        isLoadingError: false as false,
        isRefetchError: false as false,
        isPlaceholderData: false as false,
        isFetched: false as false,
        isFetchedAfterMount: false as false,
        isInitialLoading: false as false,
        isPaused: false as false,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        dataUpdatedAt: 0,
        isRefetching: false as false,
        isStale: false as false,
        fetchStatus: "idle" as const,
        promise: Promise.resolve([]),
        status: "success" as const,
        refetch: () =>
          Promise.resolve({ data: [] } as unknown as UseQueryResult<
            VehiclePart[],
            Error
          >),
        fetchNextPage: () => ({}),
      };
    },
  });

  return { vehicleParts: combinedQueries };
};
