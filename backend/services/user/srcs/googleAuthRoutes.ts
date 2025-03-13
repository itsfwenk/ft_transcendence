import fastify, { FastifyInstance } from "fastify";
import oauthPlugin from '@fastify/oauth2';

export default async function googleAuthRoutes(fastify: FastifyInstance) {
	fastify.register(oauthPlugin, {
		name: 'OAuth_transcendence',
		credentials: {
			client: {
				id: process.env.GOOGLE_CLIENT_ID || '', //mettre les codes secret
				secret: process.env.GOOGLE_CLIENT_SECRET || ''
			},
			auth: oauthPlugin.GOOGLE_CONFIGURATION
		},
		startRedirectPath: '/user/auth/google',
		callbackUri: 'http://localhost:4001/user/auth/google/callback',
		scope: ['profile', 'email']
	});

	fastify.get('/auth/google/callback', async fucntion (req))
}