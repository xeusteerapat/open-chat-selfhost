import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export default fp(async function (fastify: FastifyInstance) {
	await fastify.register(jwt, {
		secret: fastify.config.JWT_SECRET,
	});

	fastify.decorate(
		'authenticate',
		async function (request: FastifyRequest, reply: FastifyReply) {
			try {
				await request.jwtVerify();
			} catch (err) {
				reply.send(err);
			}
		}
	);
});
