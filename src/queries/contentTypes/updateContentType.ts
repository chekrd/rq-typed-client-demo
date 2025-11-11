import { mutationOptions } from '@tanstack/react-query';
import { TypedQueryClient } from '../typedQueryClient.type.ts';
import { contentTypeKeys } from './contentTypeKeys.ts';
import { ContentType } from './contentType.model.ts';
import { mock } from './contentType.service.mock.ts';

type Variables = {
  readonly projectId: string;
  readonly contentType: ContentType;
};

export const updateContentType = mutationOptions({
  mutationFn: async (variables: Variables) => await mock.updateContentType(variables.contentType),

  onSuccess: async (data, variables, _, context) => {
    /*
     * Demonstrated type-safe cache update with setQueryData.
     * Try change the updater cb implementation 
     */
    const queryClient = context.client as TypedQueryClient;
    queryClient.setQueryData(
      contentTypeKeys.queryKeys.detail(variables.projectId, data.id),
      () => data,
    );

    await queryClient.invalidateQueries({
      queryKey: contentTypeKeys.filterKeys.listsForEnvironment(variables.projectId),
    });
  },
});
