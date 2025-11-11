import '@tanstack/react-query';
import { ContentTypeKeyMap } from './contentTypes/contentTypeKeys.ts';
import { LanguageKeyMap } from './languages/languageKeys.ts';
import { AllKeysUnion } from './queryKeyMap.type.ts';

type QueryKey = AllKeysUnion<ContentTypeKeyMap | LanguageKeyMap>;

declare module '@tanstack/react-query' {
  interface Register {
    queryKey: QueryKey;
    defaultError: Error;
  }
}
