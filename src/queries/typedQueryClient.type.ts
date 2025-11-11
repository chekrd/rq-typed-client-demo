import {
  QueryClient,
  QueryFilters,
  QueryKey,
  QueryState,
  SetDataOptions,
  Updater,
} from '@tanstack/react-query';
import { ContentTypeKeyMap } from './contentTypes/contentTypeKeys.ts';
import { LanguageKeyMap } from './languages/languageKeys.ts';
import {
  CacheModelForKey,
  KeyToCacheModelOrUndefinedTuple,
  QueryKeysUnion,
  QueryKeyToCacheModelTuplesForKey,
} from './queryKeyMap.type.ts';

export type AllEntityKeyMap = ContentTypeKeyMap | LanguageKeyMap;

type InsufficientlyTypedQueryClientMethods =
  | 'getQueriesData'
  | 'getQueryData'
  | 'getQueryState'
  | 'setQueriesData'
  | 'setQueryData';

export type TypedQueryClient = Omit<QueryClient, InsufficientlyTypedQueryClientMethods> & {
  readonly getQueryData: <TQueryKey extends QueryKeysUnion<AllEntityKeyMap>>(
    queryKey: TQueryKey,
  ) => CacheModelForKey<TQueryKey, AllEntityKeyMap> | undefined;

  readonly getQueriesData: <TAnyKey extends QueryKey>(
    filters: QueryFilters<TAnyKey>,
  ) => Readonly<Array<QueryKeyToCacheModelTuplesForKey<TAnyKey, AllEntityKeyMap>>>;

  readonly getQueryState: <TQueryKey extends QueryKeysUnion<AllEntityKeyMap>>(
    queryKey: TQueryKey,
  ) => QueryState<CacheModelForKey<TQueryKey, AllEntityKeyMap>> | undefined;

  readonly setQueryData: <TQueryKey extends QueryKeysUnion<AllEntityKeyMap>>(
    queryKey: TQueryKey,
    updater: Updater<
      CacheModelForKey<TQueryKey, AllEntityKeyMap> | undefined,
      CacheModelForKey<TQueryKey, AllEntityKeyMap> | undefined
    >,
    options?: SetDataOptions,
  ) => CacheModelForKey<TQueryKey, AllEntityKeyMap> | undefined;

  readonly setQueriesData: <TAnyKey extends QueryKey>(
    filters: QueryFilters<TAnyKey>,
    updater: Updater<
      CacheModelForKey<TAnyKey, AllEntityKeyMap> | undefined,
      CacheModelForKey<TAnyKey, AllEntityKeyMap> | undefined
    >,
    options?: SetDataOptions,
  ) => Readonly<Array<
    KeyToCacheModelOrUndefinedTuple<QueryKeyToCacheModelTuplesForKey<TAnyKey, AllEntityKeyMap>>
  >>;
};
