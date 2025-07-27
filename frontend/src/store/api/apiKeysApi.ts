import { api } from './index';
import type { ApiKey } from '@/types';

export interface CreateApiKeyRequest {
	provider: string;
	keyName: string;
	apiKey: string;
}

export interface UpdateApiKeyRequest {
	keyName?: string;
	apiKey?: string;
	isActive?: boolean;
}

export const apiKeysApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getApiKeys: builder.query<ApiKey[], void>({
			query: () => '/keys',
			providesTags: ['ApiKey'],
		}),
		createApiKey: builder.mutation<ApiKey, CreateApiKeyRequest>({
			query: (data) => ({
				url: '/keys',
				method: 'POST',
				body: data,
			}),
			invalidatesTags: ['ApiKey'],
		}),
		updateApiKey: builder.mutation<
			ApiKey,
			{ id: number; data: UpdateApiKeyRequest }
		>({
			query: ({ id, data }) => ({
				url: `/keys/${id}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: (_, __, { id }) => [{ type: 'ApiKey', id }],
		}),
		deleteApiKey: builder.mutation<{ message: string }, number>({
			query: (id) => ({
				url: `/keys/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['ApiKey'],
		}),
	}),
});

export const {
	useGetApiKeysQuery,
	useCreateApiKeyMutation,
	useUpdateApiKeyMutation,
	useDeleteApiKeyMutation,
} = apiKeysApi;
