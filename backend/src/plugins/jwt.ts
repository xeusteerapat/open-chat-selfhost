import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import type { FastifyInstance } from 'fastify';

export default fp(async function (fastify: FastifyInstance) {
	await fastify.register(jwt, {
		secret: fastify.config.JWT_SECRET,
	});

	fastify.decorate('authenticate', async function (request: any, reply: any) {
		try {
			await request.jwtVerify();
		} catch (err) {
			reply.send(err);
		}
	});
});
