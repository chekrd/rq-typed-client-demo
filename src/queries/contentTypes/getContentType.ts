import { queryOptions } from '@tanstack/react-query';
import { contentTypeKeys } from './contentTypeKeys.ts';
import { mock } from './contentType.service.mock.ts';

export const getContentType = (projectId: string, contentTypeId: string) => {
  return queryOptions({
    queryKey: contentTypeKeys.queryKeys.detail(projectId, contentTypeId),
    queryFn: async ({ queryKey: [{ projectId, detailId }] }) =>
      await mock.fetchContentType(projectId, detailId),
  });
};
