import { useQueryClient as useOriginQueryClient } from '@tanstack/react-query';
import { TypedQueryClient } from './typedQueryClient.type.ts';

export const useQueryClient = (): TypedQueryClient => {
  return useOriginQueryClient() as TypedQueryClient;
};
