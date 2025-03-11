import { FastifyInstance, FastifyPluginOptions, FastifySchema } from 'fastify';
import { registerUser, loginUser, getUserProfile, getUserByIdController, updateProfile } from './userController.js';


const User = {
	type: 'object',
	properties: {
	  id: { type: 'string' },
	  userName: { type: 'string' },
	  email: { type: 'string' },
	},
}

export default async function userRoutes(fastify: any) {
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['userName', 'email', 'password'],
        properties: {
          userName: { type: 'string' },
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
            userName: { type: 'string' },
            email: { type: 'string' }
          }
        }
      }
    }
  }, getUserProfile);

  fastify.get("/:userId", getUserByIdController);

  fastify.put('/profile', {
	preHandler: [fastify.authenticate],
	schema: {
	  headers: {
		type: 'object',
		properties: {
		  Authorization: { type: 'string', description: 'Bearer <token>' }
		},
		required: ['Authorization']
	  },
	  body: {
		type: 'object',
		properties: {
		  userName: { type: 'string' },
		  email: { type: 'string', format: 'email' },
		  password: { type: 'string', minLength: 6 }
		}
	  },
	  response: {
		200: {
		  type: 'object',
		  properties: {
			success: { type: 'boolean' },
			user: {
			  type: 'object',
			  properties: {
				userId: { type: 'number' },
				userName: { type: 'string' },
				email: { type: 'string' }
			  }
			}
		  }
		}
	  }
	}
  }, updateProfile);
}