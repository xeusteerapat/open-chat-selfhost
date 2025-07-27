import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';

export default fp(async function (fastify: FastifyInstance) {
	await fastify.register(swagger, {
		openapi: {
			openapi: '3.0.0',
			info: {
				title: 'Open Chat API',
				description: 'API for self-hosted AI chat application',
				version: '1.0.0',
			},
			servers: [
				{
					url: 'http://localhost:3000',
					description: 'Development server',
				},
			],
			components: {
				securitySchemes: {
					bearerAuth: {
						type: 'http',
						scheme: 'bearer',
						bearerFormat: 'JWT',
					},
				},
			},
		},
	});

	await fastify.register(swaggerUi, {
		routePrefix: '/docs',
		uiConfig: {
			docExpansion: 'full',
			deepLinking: false,
		},
		uiHooks: {
			onRequest: function (request, reply, next) {
				next();
			},
			preHandler: function (request, reply, next) {
				next();
			},
		},
		staticCSP: true,
		transformStaticCSP: (header) => header,
		transformSpecification: (swaggerObject, request, reply) => {
			return swaggerObject;
		},
		transformSpecificationClone: true,
	});
});
