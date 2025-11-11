import { queryOptions } from '@tanstack/react-query';
import { languageKeys } from './languageKeys.ts';
import { mock } from './language.service.mock.ts';

export const languagesQuery = (projectId: string) => {
  return queryOptions({
    queryKey: languageKeys.queryKeys.list(projectId),
    queryFn: async ({ queryKey: [{ projectId }] }) => await mock.fetchLanguages(projectId)
  });
};
