import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { createDatabase } from './db/index.js';
import envPlugin from './plugins/env.js';
import jwtPlugin from './plugins/jwt.js';
import swaggerPlugin from './plugins/swagger.js';
import authRoutes from './routes/auth.js';
import apiKeyRoutes from './routes/apiKeys.js';
import conversationRoutes from './routes/conversations.js';
import providerRoutes from './routes/providers.js';
import { setEncryptionKey } from './utils/crypto.js';

const fastify = Fastify({
	logger: {
		level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
	},
});

declare module 'fastify' {
	interface FastifyInstance {
		db: Awaited<ReturnType<typeof createDatabase>>['db'];
		authenticate: (
			request: FastifyRequest,
			reply: FastifyReply
		) => Promise<void>;
	}
}

async function start() {
	try {
		await fastify.register(envPlugin);

		const port = Number(fastify.config.PORT);
		const host = fastify.config.HOST;

		setEncryptionKey(fastify.config.ENCRYPTION_KEY);

		await fastify.register(cors, {
			origin: fastify.config.ALLOWED_ORIGINS.split(','),
			credentials: true,
		});

		await fastify.register(websocket);

		const { db } = await createDatabase(fastify.config.DATABASE_URL);
		fastify.decorate('db', db);

		await fastify.register(jwtPlugin);
		await fastify.register(swaggerPlugin);

		await fastify.register(authRoutes, { prefix: '/api' });
		await fastify.register(apiKeyRoutes, { prefix: '/api' });
		await fastify.register(conversationRoutes, { prefix: '/api' });
		await fastify.register(providerRoutes, { prefix: '/api' });

		fastify.get('/health', async (request, reply) => {
			return { status: 'ok', timestamp: new Date().toISOString() };
		});

		await fastify.listen({ port, host });

		console.log(`Server running on http://${host}:${port}`);
		console.log(`API documentation available at http://${host}:${port}/docs`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

start();
