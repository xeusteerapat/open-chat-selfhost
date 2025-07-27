import { api } from './index';
import type { Conversation, Message } from '@/types';

export interface CreateConversationRequest {
	title: string;
	provider: string;
	model: string;
}

export interface UpdateConversationRequest {
	title: string;
}

export interface ConversationWithMessages extends Conversation {
	messages: Message[];
}

export interface SendMessageRequest {
	content: string;
	provider: string;
	model: string;
}

export const conversationsApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getConversations: builder.query<Conversation[], void>({
			query: () => '/conversations',
			providesTags: ['Conversation'],
		}),
		getConversation: builder.query<ConversationWithMessages, number>({
			query: (id) => `/conversations/${id}`,
			providesTags: (_, __, id) => [{ type: 'Conversation', id }],
		}),
		createConversation: builder.mutation<
			Conversation,
			CreateConversationRequest
		>({
			query: (data) => ({
				url: '/conversations',
				method: 'POST',
				body: data,
			}),
			invalidatesTags: ['Conversation'],
		}),
		updateConversation: builder.mutation<
			Conversation,
			{ id: number; data: UpdateConversationRequest }
		>({
			query: ({ id, data }) => ({
				url: `/conversations/${id}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: (_, __, { id }) => [
				{ type: 'Conversation', id },
				'Conversation', // This invalidates the list query too
			],
		}),
		deleteConversation: builder.mutation<{ message: string }, number>({
			query: (id) => ({
				url: `/conversations/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Conversation'],
		}),
		sendMessage: builder.mutation<
			Message,
			{ conversationId: number; data: SendMessageRequest }
		>({
			query: ({ conversationId, data }) => ({
				url: `/conversations/${conversationId}/messages`,
				method: 'POST',
				body: data,
			}),
			invalidatesTags: (_, __, { conversationId }) => [
				{ type: 'Conversation', id: conversationId },
			],
		}),
	}),
});

export const {
	useGetConversationsQuery,
	useGetConversationQuery,
	useCreateConversationMutation,
	useUpdateConversationMutation,
	useDeleteConversationMutation,
	useSendMessageMutation,
} = conversationsApi;
