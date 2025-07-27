import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema.js';
import { hashPassword, comparePassword } from '../utils/auth.js';
import type { AuthTokenPayload } from '../types/index.js';

const registerSchema = z.object({
	username: z.string().min(3).max(50),
	email: z.string().email().max(100),
	password: z.string().min(6),
});

const loginSchema = z.object({
	username: z.string(),
	password: z.string(),
});

export default async function authRoutes(fastify: FastifyInstance) {
	fastify.post(
		'/auth/register',
		{
			schema: {
				tags: ['Auth'],
				body: {
					type: 'object',
					required: ['username', 'email', 'password'],
					properties: {
						username: { type: 'string', minLength: 3, maxLength: 50 },
						email: { type: 'string', format: 'email' },
						password: { type: 'string', minLength: 6 },
					},
				},
			},
		},
		async (request, reply) => {
			const { username, email, password } = registerSchema.parse(request.body);

			try {
				const existingUser = await fastify.db
					.select()
					.from(users)
					.where(eq(users.email, email))
					.limit(1);

				if (existingUser.length > 0) {
					return reply.code(400).send({ error: 'User already exists' });
				}

				const passwordHash = await hashPassword(password);

				const [newUser] = await fastify.db
					.insert(users)
					.values({
						username,
						email,
						passwordHash,
					})
					.returning();

				const token = fastify.jwt.sign({
					userId: newUser.id,
					username: newUser.username,
				} satisfies AuthTokenPayload);

				reply.send({
					user: {
						id: newUser.id,
						username: newUser.username,
						email: newUser.email,
					},
					token,
				});
			} catch (error) {
				fastify.log.error(error);
				reply.code(500).send({ error: 'Internal server error' });
			}
		}
	);

	fastify.post(
		'/auth/login',
		{
			schema: {
				tags: ['Auth'],
				body: {
					type: 'object',
					required: ['username', 'password'],
					properties: {
						username: { type: 'string' },
						password: { type: 'string' },
					},
				},
			},
		},
		async (request, reply) => {
			const { username, password } = loginSchema.parse(request.body);

			try {
				const [user] = await fastify.db
					.select()
					.from(users)
					.where(eq(users.username, username))
					.limit(1);

				if (!user || !(await comparePassword(password, user.passwordHash))) {
					return reply.code(401).send({ error: 'Invalid credentials' });
				}

				const token = fastify.jwt.sign({
					userId: user.id,
					username: user.username,
				} satisfies AuthTokenPayload);

				reply.send({
					user: {
						id: user.id,
						username: user.username,
						email: user.email,
					},
					token,
				});
			} catch (error) {
				fastify.log.error(error);
				reply.code(500).send({ error: 'Internal server error' });
			}
		}
	);

	fastify.get(
		'/auth/me',
		{
			preHandler: [fastify.authenticate],
			schema: {
				tags: ['Auth'],
				security: [{ bearerAuth: [] }],
			},
		},
		async (request, reply) => {
			const payload = request.user as AuthTokenPayload;

			try {
				const [user] = await fastify.db
					.select()
					.from(users)
					.where(eq(users.id, payload.userId))
					.limit(1);

				if (!user) {
					return reply.code(404).send({ error: 'User not found' });
				}

				reply.send({
					id: user.id,
					username: user.username,
					email: user.email,
				});
			} catch (error) {
				fastify.log.error(error);
				reply.code(500).send({ error: 'Internal server error' });
			}
		}
	);
}
