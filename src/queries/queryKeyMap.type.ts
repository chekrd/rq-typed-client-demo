type QueryKey = readonly [Record<string, unknown>];

type QueryKeyCreator = (...args: readonly any[]) => QueryKey;

type KeyName = string;

type CacheModel = Record<string, any>;

type KeyGroup<TKeyShape extends QueryKey | QueryKeyCreator = never> = Record<
  KeyName,
  TKeyShape
>;

type KeyGroups<TKeyShape extends QueryKey | QueryKeyCreator = never> = {
  readonly filterKeys: KeyGroup<TKeyShape>;
  readonly queryKeys: KeyGroup<TKeyShape>;
};

/**
 * Traverse through key creators and convert QueryKeyCreator functions to final QueryKey.
 *
 * Example:
 * Input TKeyGroups: { filterKeys: { filterKey1: (a,b) => [a,b] }, queryKeys: { queryKey1: (a,b,c) => [a,b,c] } }
 * Output: { filterKeys: { filterKey1: [a,b] }, queryKeys: { queryKey1: [a,b,c] } }
 */
type KeyGroupNameToKeyNameAndShape<TKeyGroups extends KeyGroups<QueryKey | QueryKeyCreator>> = {
  readonly [TKeyGroupName in keyof TKeyGroups]: TKeyGroups[TKeyGroupName] extends infer TKeyGroup
    ? {
        readonly [TKeyName in keyof TKeyGroup]: TKeyGroup[TKeyName] extends QueryKey
          ? TKeyGroup[TKeyName]
          : TKeyGroup[TKeyName] extends QueryKeyCreator
            ? ReturnType<TKeyGroup[TKeyName]>
            : never;
      }
    : never;
};

/**
 * Every query key must extend at least one filter key.
 * This type filters query keys that extend the received key shape.
 *
 * Example for TKeyShape being a queryKey:
 * Input TKeyShape: [a,b,c]
 * Input TQueryKeyShapesUnion: [a,b,c] | [a,b,d]
 * Output: [a,b,c]
 *
 * Example for TKeyShape being a filterKey:
 * Input TKeyShape: [a,b]
 * Input TQueryKeyShapesUnion: [a,b,c] | [a,b,d]
 * Output: [a,b,c] | [a,b,d]
 */
type GetQueryKeysForKey<
  TKeyShape extends QueryKey,
  TQueryKeyShapesUnion extends QueryKey,
> = TQueryKeyShapesUnion extends infer TQueryKey extends TKeyShape ? TQueryKey : never;

/**
 * Returns a map of all query key names to their key shapes.
 *
 * Example:
 * Input TKeyGroups: { filterKeys: { filterKey1: [a,b] }, queryKeys: { queryKey1: [a,b,c] } }
 * Output: { queryKey1: [a,b,c] }
 */
type QueryKeyNamesToKeyShape<TKeyGroups extends KeyGroups<QueryKey>> =
  TKeyGroups['queryKeys'] extends infer TQueryKeys
    ? { readonly [TQueryKeyName in keyof TQueryKeys]: TQueryKeys[TQueryKeyName] }
    : never;

/**
 * Creates a map of all key names to union of query keys the key name can ever point to.
 *
 * Example:
 * Input TAllKeyNamesToKeyShape: { filterKey1: [a,b], queryKey1: [a,b,c] }
 * Input TKeyGroups: { filterKeys: { filterKey1: [a,b] }, queryKeys: { queryKey1: [a,b,c] } }
 * Output: { filterKey1: [a,b,c], queryKey1: [a,b,c] }
 */
type KeyNamesToQueryKeys<
  TAllKeyNamesToKeyShape extends Record<KeyName, QueryKey>,
  TKeyGroups extends KeyGroups<QueryKey>,
> = QueryKeyNamesToKeyShape<TKeyGroups> extends infer TQueryKeyNamesToKeyShape extends
  Record<KeyName, QueryKey>
  ? UnionToTuple<TQueryKeyNamesToKeyShape[keyof TQueryKeyNamesToKeyShape]> extends infer TQueryKeyShapesUnion extends QueryKey
    ? {
        readonly [TKeyName in keyof TAllKeyNamesToKeyShape]: GetQueryKeysForKey<
          TAllKeyNamesToKeyShape[TKeyName],
          TQueryKeyShapesUnion
        >;
      }
    : never
  : never;

// Helper type to convert union to tuple for distribution
type UnionToTuple<T> = T;

/**
 * Flattens key groups and returns a map of all key names to their key shape.
 *
 * Example:
 * Input TKeyGroups: { filterKeys: { filterKey1: [a,b] }, queryKeys: { queryKey1: [a,b,c] } }
 * Output: { filterKey1: [a,b], queryKey1: [a,b,c] }
 */
type AllKeyNamesToKeyShape<TKeyGroups extends KeyGroups<QueryKey>> = TKeyGroups['filterKeys'] &
  TKeyGroups['queryKeys'] extends infer TAllKeys
  ? { readonly [TKeyName in keyof TAllKeys]: TAllKeys[TKeyName] }
  : never;

/**
 * Accepts a map of query key names to their cache model and a map of all key names to their key shape.
 * Transforms into a tuple union of query key shapes and their cache model.
 *
 * Example:
 * Input TAllKeyNamesToKeyShape: { filterKey1: [a,b], queryKey1: [a,b,c1], queryKey2: [a,b,c2] }
 * Input TQueryKeyNamesToCacheModel: { queryKey1: ABC1Model, queryKey2: ABC2Model }
 * Output: [[a,b,c1], ABC1Model] | [[a,b,c2], ABC2Model]
 */
type QueryKeyToCacheModelForAllQueryKeys<
  TQueryKeyNamesToCacheModel extends Record<KeyName, CacheModel>,
  TAllKeyNamesToKeyShape extends Record<string, QueryKey>,
> = keyof TQueryKeyNamesToCacheModel extends infer TKeyName
  ? TKeyName extends keyof TAllKeyNamesToKeyShape & keyof TQueryKeyNamesToCacheModel
    ? [QueryKey: TAllKeyNamesToKeyShape[TKeyName], CacheModel: TQueryKeyNamesToCacheModel[TKeyName]]
    : never // All keys from TQueryKeyNamesToCacheModel must have matching keys in TAllKeyNamesToKeyShape.
  : never;

/**
 * For the given TQueryKey returns a tuple [queryKey, cache model].
 *
 * Example for TQueryKey being a single query key:
 * Input TQueryKey: [a,b,c1]
 * Input TQueryKeyToCacheModelTupleUnion: [[a,b,c1], ABC1Model] | [[a,b,c2], ABC2Model]
 * Output: [[a,b,c1], ABC1Model]
 *
 * Example for TQueryKey being a union of query keys:
 * Input TQueryKey: [a,b,c1] | [a,b,c2]
 * Input TQueryKeyToCacheModelTupleUnion: [[a,b,c1], ABC1Model] | [[a,b,c2], ABC2Model]
 * Output: [[a,b,c1], ABC1Model] | [[a,b,c2], ABC2Model]
 */
type QueryKeyToCacheModelForSpecificQueryKey<
  TQueryKey extends QueryKey,
  TQueryKeyToCacheModelTupleUnion extends [QueryKey, unknown],
> = TQueryKeyToCacheModelTupleUnion extends [TQueryKey, infer TCacheModel]
  ? TQueryKeyToCacheModelTupleUnion extends [infer TKey, any]
    ? [QueryKey: TKey, CacheModel: TCacheModel]
    : never
  : never;

/**
 * Creates a map of relations between filter keys, query keys and cache models for the entity.
 * This map is used for deriving types when working with the query cache.
 *
 * As an example, we can get many cache records as a result of a filter query. To keep track of
 * what models we can receive/update, we must derive the type based on the specific filter key.
 */
export type QueryKeyMap<
  TKeyGroups extends KeyGroups<QueryKey | QueryKeyCreator>,
  TQueryKeyNameToCacheModel extends Record<keyof TKeyGroups['queryKeys'], CacheModel>,
> = KeyGroupNameToKeyNameAndShape<TKeyGroups> extends infer TKeyGroupNameToKeyNameAndShape extends
  KeyGroups<QueryKey>
  ? AllKeyNamesToKeyShape<TKeyGroupNameToKeyNameAndShape> extends infer TAllKeyNamesToKeyShape extends
      Record<KeyName, QueryKey>
    ? KeyNamesToQueryKeys<
        TAllKeyNamesToKeyShape,
        TKeyGroupNameToKeyNameAndShape
      > extends infer TKeyNameToQueryKeys extends Record<KeyName, QueryKey>
      ? {
          readonly [TKeyName in keyof TKeyNameToQueryKeys]: {
            readonly filterKey: TKeyName extends keyof TAllKeyNamesToKeyShape
              ? TAllKeyNamesToKeyShape[TKeyName]
              : never;
            readonly queryKey: TKeyNameToQueryKeys[TKeyName];
            readonly queryKeyToCacheModel: QueryKeyToCacheModelForSpecificQueryKey<
              TKeyNameToQueryKeys[TKeyName],
              QueryKeyToCacheModelForAllQueryKeys<TQueryKeyNameToCacheModel, TAllKeyNamesToKeyShape>
            >;
          };
        }
      : never
    : never
  : never;

type EntityQueryKeyMap = Record<
  KeyName,
  {
    readonly filterKey: QueryKey;
    readonly queryKey: QueryKey;
    readonly queryKeyToCacheModel: readonly [QueryKey, CacheModel];
  }
>;

export type AllKeysUnion<TEntityQueryKeyMap extends EntityQueryKeyMap> =
  TEntityQueryKeyMap[keyof TEntityQueryKeyMap]['filterKey' | 'queryKey'];

export type QueryKeysUnion<TEntityQueryKeyMap extends EntityQueryKeyMap> =
  TEntityQueryKeyMap[keyof TEntityQueryKeyMap]['queryKey'];

export type QueryKeyToCacheModelTuplesForKey<
  TAnyKey extends QueryKey,
  TKeyNameToShapes extends EntityQueryKeyMap,
> = TKeyNameToShapes extends EntityQueryKeyMap
  ? TKeyNameToShapes[keyof TKeyNameToShapes] extends infer TEntries
    ? TEntries extends {
        readonly filterKey: TAnyKey;
        readonly queryKeyToCacheModel: infer TQueryKeyToCacheModelTuple;
      }
      ? TQueryKeyToCacheModelTuple
      : never
    : never
  : never;

export type KeyToCacheModelOrUndefinedTuple<TAnyKeyToCacheModelTuple extends [QueryKey, unknown]> =
  TAnyKeyToCacheModelTuple extends [infer TAnyKey, infer TCacheModel]
    ? [TAnyKey, TCacheModel | undefined]
    : never;

export type CacheModelForKey<
  TAnyKey extends QueryKey,
  TKeyNameToShapes extends EntityQueryKeyMap,
> = TKeyNameToShapes extends EntityQueryKeyMap
  ? QueryKeyToCacheModelTuplesForKey<TAnyKey, TKeyNameToShapes>[1]
  : never;
