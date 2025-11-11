import { QueryKeyMap } from '../queryKeyMap.type.ts';
import { Language } from './language.model.ts';

export const languageKeys = {
  filterKeys: {
    all: [{ type: 'language' }] as const,
    allForEnvironment: (projectId: string) =>
      [{ ...languageKeys.filterKeys.all[0], projectId }] as const,
    listsForEnvironment: (projectId: string) =>
      [
        {
          ...languageKeys.filterKeys.allForEnvironment(projectId)[0],
          scope: 'list',
        },
      ] as const,
  },
  queryKeys: {
    list: (projectId: string) =>
      [{ ...languageKeys.filterKeys.listsForEnvironment(projectId)[0] }] as const,
  },
} as const;

/**
 * Map query key names to their cache models.
 */
type QueryKeyNameToCacheModel = {
  readonly list: Readonly<Array<Language>>;
};

/**
 * Generate the complete type map for language queries.
 */
export type LanguageKeyMap = QueryKeyMap<typeof languageKeys, QueryKeyNameToCacheModel>;
