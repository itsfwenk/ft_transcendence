import { FastifyInstance } from 'fastify';
import fastifyHttpProxy from '@fastify/http-proxy';

export default async function userProxy(fastify:FastifyInstance) {
	fastify.register(fastifyHttpProxy, {
		upstream: 'http://user:4001',
		prefix: '/user',
		rewritePrefix: '/user',
	})
};