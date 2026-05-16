import { useQueries } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

type TQueries = UseQueryOptions<{
  id: number;
  make: string;
  partsCount: number;
}>[];

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
        isPending: results.some((result) => result.isPending),
        isLoading: results.some((result) => result.isLoading),
        error: results.some((result) => result.error !== null)
          ? new Error("an error occured")
          : null,
        isFetching: results.some((result) => result.isFetching),
        isSuccess: results.some((result) => result.isSuccess),
        isError: results.some((result) => result.isError),
        isLoadingError: false,
        isRefetchError: false,
        isPlaceholderData: false,
        isFetched: false,
        isFetchedAfterMount: false,
        isInitialLoading: false,
        isPaused: false,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        dataUpdatedAt: 0,
        isRefetching: false,
        isStale: false,
        fetchStatus: "idle",
        promise: null,
        status: results.some((result) => result.status === "error")
          ? "error"
          : "idle",
        refetch: () => Promise.resolve([]),
        fetchNextPage: () => ({}),
      };
    },
  });

  return { vehicleParts: combinedQueries };
};
