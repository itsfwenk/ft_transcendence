import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import oauthPlugin, { fastifyOauth2 } from '@fastify/oauth2';
import { getAuthStatus, handlerGoogleCallback, linkGoogleAccount, unlinkGoogleAccount } from "./googleAuthController.js";

declare module 'fastify' {
	interface FastifyInstance {
	  authenticate: any;
	  googleOAuth2: any;
	}
  }

  type GoogleOAuthContext = {
	googleOAuth2: {
		getAccessTokenFromAuthorizationCodeFlow: (req: FastifyRequest) => Promise<any>;
	}
  };

export default async function googleAuthRoutes(fastify: FastifyInstance) {
	// const baseUrl = window.location.origin;
	// console.log(`${baseUrl}/user/auth/google/callback`);
	fastify.register(oauthPlugin, {
		name: 'googleOAuth2',
		credentials: {
			client: {
				id: process.env.GOOGLE_CLIENT_ID || '', //mettre les codes secret
				secret: process.env.GOOGLE_CLIENT_SECRET || '',
			},
			auth: oauthPlugin.GOOGLE_CONFIGURATION
		},
		startRedirectPath: '/auth/google',
		callbackUri: 'http://localhost:4000/api-user/auth/google/callback',
		scope: ['profile', 'email']
	});

	fastify.after(() => {

		fastify.get('/auth/google/callback', {
			schema: {
			  response: {
				302: {
				  type: 'object',
				  properties: {}
				}
			  }
			}
		  }, async function(request, reply) {
			return handlerGoogleCallback.call(
			  { googleOAuth2: (this as any).googleOAuth2 }, 
			  request, 
			  reply
			);
		  });

		  fastify.get('/auth/status', { 
			preHandler: [(fastify as any).authenticate],
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
		  }, function(request, reply) {
			return getAuthStatus(request as any, reply);
		  });

		  fastify.get('/link/google', {
			preHandler: [(fastify as any).authenticate],
			schema: {
			  headers: {
				type: 'object',
				properties: {
				  Authorization: { type: 'string', description: 'Bearer <token>' }
				},
				required: ['Authorization']
			  }
			}
		  }, function(request, reply) {
			return linkGoogleAccount(request as any, reply);
		  });

		  fastify.delete('/unlink/google', {
			preHandler: [(fastify as any).authenticate],
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
		  }, function(request, reply) {
			return unlinkGoogleAccount(request as any, reply);
		  });
		});

		fastify.get('/login_success', (request, reply) => {
			const { token, new: isNewUser } = request.query as any;
			reply.type('text/html').send(`
			  <html>
				<body>
				  <h1>Login Successful!</h1>
				  <p>Your token: ${token}</p>
				  <p>New user: ${isNewUser}</p>
				  <script>
					// Store token in localStorage
					localStorage.setItem('authToken', '${token}');
					// Redirect to home page after 3 seconds
					setTimeout(() => window.location.href = '/', 3000);
				  </script>
				</body>
			  </html>
			`);
		  });
		
		  fastify.get('/login_error', (request, reply) => {
			reply.type('text/html').send(`
			  <html>
				<body>
				  <h1>Login Failed</h1>
				  <p>There was an error during authentication.</p>
				  <a href="/">Go back to home</a>
				</body>
			  </html>
			`);
		  });
}