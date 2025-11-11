import { QueryKeyMap } from '../queryKeyMap.type.ts';
import { ContentType, ContentTypes } from './contentType.model.ts';

export const contentTypeKeys = {
  filterKeys: {
    all: [{ type: 'contentType' }] as const,
    allForEnvironment: (projectId: string) =>
      [{ ...contentTypeKeys.filterKeys.all[0], projectId }] as const,
    detailsForEnvironment: (projectId: string) =>
      [
        {
          ...contentTypeKeys.filterKeys.allForEnvironment(projectId)[0],
          scope: 'detail',
        },
      ] as const,
    listsForEnvironment: (projectId: string) =>
      [
        {
          ...contentTypeKeys.filterKeys.allForEnvironment(projectId)[0],
          scope: 'list',
        },
      ] as const,
  },
  queryKeys: {
    detail: (projectId: string, detailId: string) =>
      [
        {
          ...contentTypeKeys.filterKeys.detailsForEnvironment(projectId)[0],
          detailId,
        },
      ] as const,
    list: (projectId: string, filter?: Record<string, string>) =>
      [
        {
          ...contentTypeKeys.filterKeys.listsForEnvironment(projectId)[0],
          filter: filter ?? {},
        },
      ] as const,
  },
} as const;

/**
 * Map query key names to their cache models.
 * This tells the type system what data each query returns.
 */
type QueryKeyNameToCacheModel = {
  readonly detail: ContentType;
  readonly list: ContentTypes;
};

/**
 * Generate the complete type map for content type queries.
 * This enables full type safety when accessing the cache.
 */
export type ContentTypeKeyMap = QueryKeyMap<typeof contentTypeKeys, QueryKeyNameToCacheModel>;
