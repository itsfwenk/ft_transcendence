import { FastifyInstance } from 'fastify';
import fastifyHttpProxy from '@fastify/http-proxy';

export default async function gameProxy(fastify:FastifyInstance) {
	fastify.register(fastifyHttpProxy, {
		upstream: 'http://localhost:4002',
		prefix: '/game',
		rewritePrefix: '/game',
	})
};