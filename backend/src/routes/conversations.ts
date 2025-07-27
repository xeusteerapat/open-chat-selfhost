import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { conversations, messages, apiKeys } from '../db/schema.js';
import type { AuthTokenPayload } from '../types/index.js';
import { aiProviderManager } from '../services/aiProviders.js';
import { decryptApiKey } from '../utils/crypto.js';

const createConversationSchema = z.object({
	title: z.string().min(1).max(255),
	provider: z.string().min(1).max(50),
	model: z.string().min(1).max(100),
});

const updateConversationSchema = z.object({
	title: z.string().min(1).max(255).optional(),
});

const sendMessageSchema = z.object({
	content: z.string().min(1),
	provider: z.string().min(1).max(50),
	model: z.string().min(1).max(100),
});

export default async function conversationRoutes(fastify: FastifyInstance) {
	fastify.addHook('preHandler', fastify.authenticate);

	fastify.post(
		'/conversations',
		{
			schema: {
				tags: ['Conversations'],
				security: [{ bearerAuth: [] }],
				body: {
					type: 'object',
					required: ['title', 'provider', 'model'],
					properties: {
						title: { type: 'string', minLength: 1, maxLength: 255 },
						provider: { type: 'string', minLength: 1, maxLength: 50 },
						model: { type: 'string', minLength: 1, maxLength: 100 },
					},
				},
			},
		},
		async (request, reply) => {
			const payload = request.user as AuthTokenPayload;
			const { title, provider, model } = createConversationSchema.parse(
				request.body
			);

			try {
				const [newConversation] = await fastify.db
					.insert(conversations)
					.values({
						userId: payload.userId,
						title,
						provider,
						model,
					})
					.returning();

				reply.send(newConversation);
			} catch (error) {
				fastify.log.error(error);
				reply.code(500).send({ error: 'Internal server error' });
			}
		}
	);

	fastify.get(
		'/conversations',
		{
			schema: {
				tags: ['Conversations'],
				security: [{ bearerAuth: [] }],
			},
		},
		async (request, reply) => {
			const payload = request.user as AuthTokenPayload;

			try {
				const userConversations = await fastify.db
					.select()
					.from(conversations)
					.where(eq(conversations.userId, payload.userId))
					.orderBy(desc(conversations.updatedAt));

				reply.send(userConversations);
			} catch (error) {
				fastify.log.error(error);
				reply.code(500).send({ error: 'Internal server error' });
			}
		}
	);

	fastify.get(
		'/conversations/:id',
		{
			schema: {
				tags: ['Conversations'],
				security: [{ bearerAuth: [] }],
				params: {
					type: 'object',
					properties: {
						id: { type: 'number' },
					},
				},
			},
		},
		async (request, reply) => {
			const payload = request.user as AuthTokenPayload;
			const conversationId = Number((request.params as any).id);

			try {
				const [conversation] = await fastify.db
					.select()
					.from(conversations)
					.where(
						and(
							eq(conversations.id, conversationId),
							eq(conversations.userId, payload.userId)
						)
					)
					.limit(1);

				if (!conversation) {
					return reply.code(404).send({ error: 'Conversation not found' });
				}

				const conversationMessages = await fastify.db
					.select()
					.from(messages)
					.where(eq(messages.conversationId, conversationId))
					.orderBy(messages.createdAt);

				reply.send({
					...conversation,
					messages: conversationMessages,
				});
			} catch (error) {
				fastify.log.error(error);
				reply.code(500).send({ error: 'Internal server error' });
			}
		}
	);

	fastify.put(
		'/conversations/:id',
		{
			schema: {
				tags: ['Conversations'],
				security: [{ bearerAuth: [] }],
				params: {
					type: 'object',
					properties: {
						id: { type: 'number' },
					},
				},
				body: {
					type: 'object',
					properties: {
						title: { type: 'string', minLength: 1, maxLength: 255 },
					},
				},
			},
		},
		async (request, reply) => {
			const payload = request.user as AuthTokenPayload;
			const conversationId = Number((request.params as any).id);
			const updates = updateConversationSchema.parse(request.body);

			try {
				const [updatedConversation] = await fastify.db
					.update(conversations)
					.set({ ...updates, updatedAt: new Date() })
					.where(
						and(
							eq(conversations.id, conversationId),
							eq(conversations.userId, payload.userId)
						)
					)
					.returning();

				if (!updatedConversation) {
					return reply.code(404).send({ error: 'Conversation not found' });
				}

				reply.send(updatedConversation);
			} catch (error) {
				fastify.log.error(error);
				reply.code(500).send({ error: 'Internal server error' });
			}
		}
	);

	fastify.delete(
		'/conversations/:id',
		{
			schema: {
				tags: ['Conversations'],
				security: [{ bearerAuth: [] }],
				params: {
					type: 'object',
					properties: {
						id: { type: 'number' },
					},
				},
			},
		},
		async (request, reply) => {
			const payload = request.user as AuthTokenPayload;
			const conversationId = Number((request.params as any).id);

			try {
				await fastify.db
					.delete(messages)
					.where(eq(messages.conversationId, conversationId));

				const [deletedConversation] = await fastify.db
					.delete(conversations)
					.where(
						and(
							eq(conversations.id, conversationId),
							eq(conversations.userId, payload.userId)
						)
					)
					.returning();

				if (!deletedConversation) {
					return reply.code(404).send({ error: 'Conversation not found' });
				}

				reply.send({ message: 'Conversation deleted successfully' });
			} catch (error) {
				fastify.log.error(error);
				reply.code(500).send({ error: 'Internal server error' });
			}
		}
	);

	fastify.post(
		'/conversations/:id/messages',
		{
			schema: {
				tags: ['Conversations'],
				security: [{ bearerAuth: [] }],
				params: {
					type: 'object',
					properties: {
						id: { type: 'number' },
					},
				},
				body: {
					type: 'object',
					required: ['content', 'provider', 'model'],
					properties: {
						content: { type: 'string', minLength: 1 },
						provider: { type: 'string', minLength: 1, maxLength: 50 },
						model: { type: 'string', minLength: 1, maxLength: 100 },
					},
				},
			},
		},
		async (request, reply) => {
			const payload = request.user as AuthTokenPayload;
			const conversationId = Number((request.params as any).id);
			const { content, provider, model } = sendMessageSchema.parse(
				request.body
			);

			try {
				// Verify conversation exists and belongs to user
				const [conversation] = await fastify.db
					.select()
					.from(conversations)
					.where(
						and(
							eq(conversations.id, conversationId),
							eq(conversations.userId, payload.userId)
						)
					)
					.limit(1);

				if (!conversation) {
					return reply.code(404).send({ error: 'Conversation not found' });
				}

				// Insert user message
				const [userMessage] = await fastify.db
					.insert(messages)
					.values({
						conversationId,
						role: 'user',
						content,
						provider,
						model,
					})
					.returning();

				// Get user's API key for the provider
				const [userApiKey] = await fastify.db
					.select()
					.from(apiKeys)
					.where(
						and(
							eq(apiKeys.userId, payload.userId),
							eq(apiKeys.provider, provider)
						)
					)
					.limit(1);

				if (!userApiKey) {
					return reply.code(400).send({
						error: `API key for provider ${provider} not found. Please add your API key first.`,
					});
				}

				// Decrypt the API key for use with AI provider
				const decryptedApiKey = decryptApiKey(userApiKey.encryptedKey);

				// Get conversation history for context
				const conversationHistory = await fastify.db
					.select()
					.from(messages)
					.where(eq(messages.conversationId, conversationId))
					.orderBy(messages.createdAt);

				// Add the new user message to history
				const allMessages = [...conversationHistory, userMessage];

				// Generate AI response
				try {
					const aiResponse = await aiProviderManager.generateResponse(
						provider,
						allMessages,
						model,
						decryptedApiKey
					);

					// Insert bot response
					const [botMessage] = await fastify.db
						.insert(messages)
						.values({
							conversationId,
							role: 'assistant',
							content: aiResponse,
							provider,
							model,
						})
						.returning();
				} catch (aiError) {
					fastify.log.error('AI provider error:', aiError);
					// Insert error message
					await fastify.db.insert(messages).values({
						conversationId,
						role: 'assistant',
						content: `Error generating response: ${
							aiError instanceof Error ? aiError.message : 'Unknown error'
						}`,
						provider,
						model,
					});
				}

				// Update conversation timestamp
				await fastify.db
					.update(conversations)
					.set({ updatedAt: new Date() })
					.where(eq(conversations.id, conversationId));

				reply.send(userMessage);
			} catch (error) {
				fastify.log.error(error);
				reply.code(500).send({ error: 'Internal server error' });
			}
		}
	);
}
