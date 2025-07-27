import { api } from './index';
import type { User } from '@/types';

export interface LoginRequest {
	username: string;
	password: string;
}

export interface RegisterRequest {
	username: string;
	email: string;
	password: string;
}

export interface AuthResponse {
	user: User;
	token: string;
}

export const authApi = api.injectEndpoints({
	endpoints: (builder) => ({
		login: builder.mutation<AuthResponse, LoginRequest>({
			query: (credentials) => ({
				url: '/auth/login',
				method: 'POST',
				body: credentials,
			}),
			invalidatesTags: ['User'],
		}),
		register: builder.mutation<AuthResponse, RegisterRequest>({
			query: (userData) => ({
				url: '/auth/register',
				method: 'POST',
				body: userData,
			}),
			invalidatesTags: ['User'],
		}),
		getCurrentUser: builder.query<User, void>({
			query: () => '/auth/me',
			providesTags: ['User'],
		}),
	}),
});

export const { useLoginMutation, useRegisterMutation, useGetCurrentUserQuery } =
	authApi;
