import { FastifyInstance } from 'fastify';
import fastifyHttpProxy from '@fastify/http-proxy';

export default async function userProxy(fastify:FastifyInstance) {
	fastify.register(fastifyHttpProxy, {
		upstream: 'http://localhost:4003',
		prefix: '/game',
		rewritePrefix: '/game',
	})
};