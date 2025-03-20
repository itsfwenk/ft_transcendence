import { FastifyInstance } from 'fastify';
import fastifyHttpProxy from '@fastify/http-proxy';

export default async function matchmakingProxy(fastify:FastifyInstance) {
	fastify.register(fastifyHttpProxy, {
		upstream: 'http://matchmaking:4003',
		prefix: '/matchmaking',
		rewritePrefix: '/matchmaking',
	})
};