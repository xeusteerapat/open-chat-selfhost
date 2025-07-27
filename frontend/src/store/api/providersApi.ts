import { api } from './index';
import type { Provider, Model } from '@/types';

export const providersApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getProviders: builder.query<Provider[], void>({
			query: () => '/providers',
			providesTags: ['Provider'],
		}),
		getProviderModels: builder.query<Model[], string>({
			query: (provider) => `/providers/${provider}/models`,
			providesTags: (result, error, provider) => [
				{ type: 'Provider', id: provider },
			],
		}),
	}),
});

export const { useGetProvidersQuery, useGetProviderModelsQuery } = providersApi;
