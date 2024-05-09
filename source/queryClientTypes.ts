import type {
  DefaultError,
  InfiniteData,
  QueryKey,
  DataTag,
  SolidInfiniteQueryOptions,
  dataTagSymbol,
} from "@tanstack/solid-query";

type UndefinedInitialDataInfiniteOptions<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
> = SolidInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey, TPageParam> & {
  initialData?: undefined;
};
type NonUndefinedGuard<T> = T extends undefined ? never : T;
type DefinedInitialDataInfiniteOptions<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
> = SolidInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey, TPageParam> & {
  initialData:
    | NonUndefinedGuard<InfiniteData<TQueryFnData, TPageParam>>
    | (() => NonUndefinedGuard<InfiniteData<TQueryFnData, TPageParam>>);
};
function infiniteQueryOptions<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: DefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
): DefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam> & {
  queryKey: DataTag<TQueryKey, InfiniteData<TQueryFnData>>;
};
function infiniteQueryOptions<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: UndefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
): UndefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam> & {
  queryKey: DataTag<TQueryKey, InfiniteData<TQueryFnData>>;
};

function infiniteQueryOptions(options: unknown) {
  return options;
}

function infiniteQueryOptionsWithoutDataTag<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey & {
    [dataTagSymbol]?: unknown;
  } = QueryKey,
  TPageParam = unknown,
>(
  options: DefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
): DefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, Omit<TQueryKey, typeof dataTagSymbol>, TPageParam>;
function infiniteQueryOptionsWithoutDataTag<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey & {
    [dataTagSymbol]?: unknown;
  } = QueryKey,
  TPageParam = unknown,
>(
  options: UndefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
): UndefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, Omit<TQueryKey, typeof dataTagSymbol>, TPageParam>;

function infiniteQueryOptionsWithoutDataTag(options: unknown) {
  return options;
}

export {
  type DefinedInitialDataInfiniteOptions,
  type UndefinedInitialDataInfiniteOptions,
  infiniteQueryOptions,
  infiniteQueryOptionsWithoutDataTag,
};
