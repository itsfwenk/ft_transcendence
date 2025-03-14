import fastify, { FastifyInstance } from "fastify";
import oauthPlugin from '@fastify/oauth2';
import { getAuthStatus, handlerGoogleCallback, linkGoogleAccount, unlinkGoogleAccount } from "./googleAuthController";

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

	fastify.get('/auth/google/callback', {
		schema: {
			response: {
				302: {
					type: 'object',
					properties: {}
				}
			}
		}
	}, handlerGoogleCallback.bind({ googleOAuth2: fastify.googleOAuth2 }));

	fastify.get('/auth/status', { 
		preHandler: [fastify.authenticate],
		schema: {
		  headers: {
			type: 'object',
			properties: {
			  Authorization: { type: 'string', description: 'Bearer <token>' }
			},
			required: ['Authorization']
		  },
		  response: {
			200: {
			  type: 'object',
			  properties: {
				user: {
				  type: 'object',
				  properties: {
					userId: { type: 'string' },
					userName: { type: 'string' },
					email: { type: 'string' },
					hasGoogleLinked: { type: 'boolean' }
				  }
				}
			  }
			}
		  }
		}
	  }, getAuthStatus);

	  fastify.get('/link/google', {
		preHandler: [fastify.authenticate],
		schema: {
		  headers: {
			type: 'object',
			properties: {
			  Authorization: { type: 'string', description: 'Bearer <token>' }
			},
			required: ['Authorization']
		  }
		}
	  }, linkGoogleAccount);

	  fastify.delete('/unlink/google', {
		preHandler: [fastify.authenticate],
		schema: {
		  headers: {
			type: 'object',
			properties: {
			  Authorization: { type: 'string', description: 'Bearer <token>' }
			},
			required: ['Authorization']
		  },
		  response: {
			200: {
			  type: 'object',
			  properties: {
				success: { type: 'boolean' },
				message: { type: 'string' }
			  }
			}
		  }
		}
	  }, unlinkGoogleAccount);
}