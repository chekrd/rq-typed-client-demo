import { queryOptions } from '@tanstack/react-query';
import { contentTypeKeys } from './contentTypeKeys.ts';
import { mock } from './contentType.service.mock.ts';

export const getContentTypes = (
  projectId: string,
  filter?: Readonly<Record<string, string>>,
) => {
  return queryOptions({
    queryKey: contentTypeKeys.queryKeys.list(projectId, filter),
    queryFn: async ({ queryKey: [{ projectId, filter }] }) =>
      await mock.fetchContentTypes(projectId, filter),
  });
};
