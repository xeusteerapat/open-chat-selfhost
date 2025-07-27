import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { apiKeys } from '../db/schema.js';
import { encryptApiKey, decryptApiKey } from '../utils/crypto.js';
import type { AuthTokenPayload } from '../types/index.js';

const createApiKeySchema = z.object({
	provider: z.string().min(1).max(50),
	keyName: z.string().min(1).max(100),
	apiKey: z.string().min(1),
});

const updateApiKeySchema = z.object({
	keyName: z.string().min(1).max(100).optional(),
	apiKey: z.string().min(1).optional(),
	isActive: z.boolean().optional(),
});

export default async function apiKeyRoutes(fastify: FastifyInstance) {
	fastify.addHook('preHandler', fastify.authenticate);

	fastify.post(
		'/keys',
		{
			schema: {
				tags: ['API Keys'],
				security: [{ bearerAuth: [] }],
				body: {
					type: 'object',
					required: ['provider', 'keyName', 'apiKey'],
					properties: {
						provider: { type: 'string', minLength: 1, maxLength: 50 },
						keyName: { type: 'string', minLength: 1, maxLength: 100 },
						apiKey: { type: 'string', minLength: 1 },
					},
				},
			},
		},
		async (request, reply) => {
			const payload = request.user as AuthTokenPayload;
			const { provider, keyName, apiKey } = createApiKeySchema.parse(
				request.body
			);

			try {
				const encryptedKey = encryptApiKey(apiKey);

				const [newApiKey] = await fastify.db
					.insert(apiKeys)
					.values({
						userId: payload.userId,
						provider,
						keyName,
						encryptedKey,
					})
					.returning();

				reply.send({
					id: newApiKey.id,
					provider: newApiKey.provider,
					keyName: newApiKey.keyName,
					isActive: newApiKey.isActive,
					createdAt: newApiKey.createdAt,
				});
			} catch (error) {
				fastify.log.error(error);
				reply.code(500).send({ error: 'Internal server error' });
			}
		}
	);

	fastify.get(
		'/keys',
		{
			schema: {
				tags: ['API Keys'],
				security: [{ bearerAuth: [] }],
			},
		},
		async (request, reply) => {
			const payload = request.user as AuthTokenPayload;

			try {
				const userApiKeys = await fastify.db
					.select({
						id: apiKeys.id,
						provider: apiKeys.provider,
						keyName: apiKeys.keyName,
						isActive: apiKeys.isActive,
						createdAt: apiKeys.createdAt,
					})
					.from(apiKeys)
					.where(eq(apiKeys.userId, payload.userId));

				reply.send(userApiKeys);
			} catch (error) {
				fastify.log.error(error);
				reply.code(500).send({ error: 'Internal server error' });
			}
		}
	);

	fastify.put(
		'/keys/:id',
		{
			schema: {
				tags: ['API Keys'],
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
						keyName: { type: 'string', minLength: 1, maxLength: 100 },
						apiKey: { type: 'string', minLength: 1 },
						isActive: { type: 'boolean' },
					},
				},
			},
		},
		async (request, reply) => {
			const payload = request.user as AuthTokenPayload;
			const keyId = Number((request.params as any).id);
			const updates = updateApiKeySchema.parse(request.body);

			try {
				const updateData: any = {};

				if (updates.keyName) updateData.keyName = updates.keyName;
				if (updates.apiKey)
					updateData.encryptedKey = encryptApiKey(updates.apiKey);
				if (updates.isActive !== undefined)
					updateData.isActive = updates.isActive;

				const [updatedKey] = await fastify.db
					.update(apiKeys)
					.set(updateData)
					.where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, payload.userId)))
					.returning();

				if (!updatedKey) {
					return reply.code(404).send({ error: 'API key not found' });
				}

				reply.send({
					id: updatedKey.id,
					provider: updatedKey.provider,
					keyName: updatedKey.keyName,
					isActive: updatedKey.isActive,
					createdAt: updatedKey.createdAt,
				});
			} catch (error) {
				fastify.log.error(error);
				reply.code(500).send({ error: 'Internal server error' });
			}
		}
	);

	fastify.delete(
		'/keys/:id',
		{
			schema: {
				tags: ['API Keys'],
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
			const keyId = Number((request.params as any).id);

			try {
				const [deletedKey] = await fastify.db
					.delete(apiKeys)
					.where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, payload.userId)))
					.returning();

				if (!deletedKey) {
					return reply.code(404).send({ error: 'API key not found' });
				}

				reply.send({ message: 'API key deleted successfully' });
			} catch (error) {
				fastify.log.error(error);
				reply.code(500).send({ error: 'Internal server error' });
			}
		}
	);
}
