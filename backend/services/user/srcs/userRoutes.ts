import fastify, { FastifyInstance, FastifyPluginOptions, FastifySchema } from 'fastify';
import { registerUser, loginUser, getUserProfile, getUserByIdController, updateProfile, deleteAccount, updateRole, updateStatus, getOnlineUsers, logoutUser } from './userController.js';
import jwt from '@fastify/jwt'


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
            user: { User } // test mettre juste User
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
  
  fastify.delete('/profile', {
	  preHandler: [fastify.authenticate],
	  handler: deleteAccount
  });

  fastify.post('/logout', {
	preHandler: [fastify.authenticate],
	handler: logoutUser
  })

  fastify.put('/role', {
	preHandler: [fastify.authenticate],
	schema: {
		body: {
			type: 'object',
			required: ['userId', 'role'],
			properties: {
				userId: { type: 'string' },
				role: { type: 'string', enum: ['user', 'admin'] }
			}
		}
	},
	handler: updateRole
  })

  fastify.put('/status', {
	preHandler: [fastify.authenticate],
	schema: {
		body: {
			type: 'object',
			required: ['status'],
			properties: {
				status: { type: 'string', enum: ['online', 'offline'] }
			}
		}
	},
	handler: updateStatus
  });

  fastify.get('/online', {
	preHandler: [fastify.authenticate],
	handler: getOnlineUsers
  });

  

}