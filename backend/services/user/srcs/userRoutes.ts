import fastify, { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest, FastifySchema } from 'fastify';
import { registerUser, loginUser, getUserProfile, getUserByIdController, updateProfile, deleteAccount, updateRole, updateStatus, getOnlineUsers, logoutUser } from './userController.js';
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart';
import { deleteAvatar, getAvatar, uplpoadAvatar } from './avatarController.js';
import { addFriendController, checkFriendshipController, getFriendsController, getOnlineFriendsController, removeFriendController } from './friendController.js';


const User = {
	type: 'object',
	properties: {
	  id: { type: 'string' },
	  userName: { type: 'string' },
	  email: { type: 'string' },
	},
}

export default async function userRoutes(fastify: any) {

  fastify.register(multipart, {
	limits: {
		fileSize: 1000000 // 1MB
	}
  });

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
            id: { type: 'string' },
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
				userId: { type: 'string' },
				userName: { type: 'string' },
				email: { type: 'string' }
			  }
			}
		  }
		}
	  }
	}
  }, updateProfile);

  fastify.put('/avatar', {
    preHandler: [fastify.authenticate],
    handler: uplpoadAvatar
  });

  fastify.delete('/avatar', {
    preHandler: [fastify.authenticate],
    handler: deleteAvatar
  });

  fastify.get('/avatar/:userId', getAvatar);
  
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

  fastify.get('/friends', {
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
            count: { type: 'number' },
            friends: { 
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  userName: { type: 'string' },
                  status: { type: 'string' },
                  avatarUrl: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    handler: getFriendsController
  });

  fastify.get('/friends/online', {
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
            count: { type: 'number' },
            friends: { 
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  userName: { type: 'string' },
                  status: { type: 'string' },
                  avatarUrl: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    handler: getOnlineFriendsController
  });

  fastify.post('/friends/:friendId', {
    preHandler: [fastify.authenticate],
    schema: {
      headers: {
        type: 'object',
        properties: {
          Authorization: { type: 'string', description: 'Bearer <token>' }
        },
        required: ['Authorization']
      },
      params: {
        type: 'object',
        properties: {
          friendId: { type: 'string' }
        },
        required: ['friendId']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            friend: {
              type: 'object',
              properties: {
                userId: { type: 'string' },
                userName: { type: 'string' },
                status: { type: 'string' },
                avatarUrl: { type: 'string' }
              }
            }
          }
        }
      }
    },
    handler: addFriendController
  });

  fastify.delete('/friends/:friendId', {
    preHandler: [fastify.authenticate],
    schema: {
      headers: {
        type: 'object',
        properties: {
          Authorization: { type: 'string', description: 'Bearer <token>' }
        },
        required: ['Authorization']
      },
      params: {
        type: 'object',
        properties: {
          friendId: { type: 'string' }
        },
        required: ['friendId']
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
    },
    handler: removeFriendController
  });

  fastify.get('/friends/check/:friendId', {
    preHandler: [fastify.authenticate],
    schema: {
      headers: {
        type: 'object',
        properties: {
          Authorization: { type: 'string', description: 'Bearer <token>' }
        },
        required: ['Authorization']
      },
      params: {
        type: 'object',
        properties: {
          friendId: { type: 'string' }
        },
        required: ['friendId']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            isFriend: { type: 'boolean' }
          }
        }
      }
    },
    handler: checkFriendshipController
  });
  interface JwtPayload {
	userId: string;
  }
  fastify.get('/getProfile', async (req:FastifyRequest, reply:FastifyReply) => {
	try {
	  const payload = await req.jwtVerify<JwtPayload>();
	  return reply.send({
		userId: payload.userId,
	  });
	} catch (err) {
	  reply.code(401).send({ error: 'Non autorisé' });
	}
  });

}