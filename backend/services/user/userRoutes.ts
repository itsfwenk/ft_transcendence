
import { registerUser, loginUser, getUserProfile } from './userController.js';


const User = {
	type: 'object',
	properties: {
	  id: { type: 'string' },
	  username: { type: 'string' },
	  email: { type: 'string' },
	},
}

export default async function userRoutes(fastify: any) {
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            user: { User }
          }
        }
      }
    },
    handler: registerUser
  });

  fastify.post('/login', {
	schema: {
		body: {
		  type: 'object',
		  required: ['email', 'password'],
		  properties: {
			email: { type: 'string', format: 'email' },
			password: { type: 'string', minLength: 6 }
		  }
		}
	  },
    handler: loginUser
  });

  fastify.get('/profile', { 
    preHandler: [fastify.authenticate],  // Protection avec JWT
    schema: {
      headers: {  // Swagger attend maintenant un token dans les headers
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
            id: { type: 'number' },
            username: { type: 'string' },
            email: { type: 'string' }
          }
        }
      }
    }
  }, getUserProfile);
}


