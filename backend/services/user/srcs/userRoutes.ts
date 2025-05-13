import fastify, { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest, FastifySchema } from 'fastify';
import { registerUser, loginUser, getUserProfile, getUserByIdController, updateProfile, deleteAccount, updateRole, updateStatus, getOnlineUsers, logoutUser, checkUserConnectionStatus, changePassword } from './userController.js';
// import jwt from '@fastify/jwt'
import jwt, { JwtPayload } from 'jsonwebtoken';
import multipart from '@fastify/multipart';
import { deleteAvatar, getAvatar, uploadAvatar } from './avatarController.js';
import { addFriendController, checkFriendshipController, getFriendsController, getOnlineFriendsController, removeFriendController } from './friendController.js';
import { getUserDashboard } from './userDashboardController.js';
import { getUserById, updateUserGameId } from './userDb.js';


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
		fileSize: 5000000 // Increased to 5MB for avatar images
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

  fastify.put('/password', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string' },
          newPassword: { type: 'string', minLength: 6 }
        }
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
    handler: changePassword
  });

  fastify.put('/avatar', {
    preHandler: [fastify.authenticate],
    handler: uploadAvatar
  });

  fastify.delete('/avatar', {
    preHandler: [fastify.authenticate],
    handler: deleteAvatar
  });

  fastify.get('/avatar/:userId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string' }
        },
        required: ['userId']
      }
    },
    handler: getAvatar
  });
  
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

  fastify.get('/status/userId', {
	schema: {
		// params: {
		// 	type:'object',
		// 	properties: {
		// 		userId: { type: 'string' }
		// 	},
		// 	// required: ['userId']
		// },
		response: {
			200: {
				type: 'object',
				properties: {
					userId: { type: 'string' },
					userName: { type: 'string' },
					isConnected: { type: 'boolean' },
					status: { type: 'string' }
				}
			}
		}
	},
	handler: async (req: FastifyRequest, reply: FastifyReply) => {
    return checkUserConnectionStatus(fastify, req, reply);
    }
  });

  fastify.get('/online', {
	preHandler: [fastify.authenticate],
	handler: getOnlineUsers
  });

  fastify.get('/friends', {
    preHandler: [fastify.authenticate],
    schema: {
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

  fastify.post('/friends/:userName', {
	preHandler: [fastify.authenticate],
	schema: {
	  params: {
		type: 'object',
		properties: {
		  userName: { type: 'string' }
		},
		required: ['userName']
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
  
  // interface JwtPayload {
	// userId: string;
  // }

	fastify.get('/getProfile', async (req:FastifyRequest, reply:FastifyReply) => {
		try {
			console.log("Cookies:", req.cookies)
			const payload = await req.jwtVerify<JwtPayload>();
			console.log("JWT payload:", payload)
			return reply.send({
			userId: payload.userId,
			});
		} catch (err) {
			console.log("Erreur JWT:", err);
			reply.code(401).send({ error: 'Non autorisé' });
		}
	});

	fastify.get('/public/:userId',
		{
		  schema: {
			params: {
			  type: 'object',
			  properties: { userId: { type: 'string', format: 'uuid' } },
			  required: ['userId']
			},
			response: {
			  200: {
				type: 'object',
				properties: {
				  userId:   { type: 'string' },
				  userName: { type: 'string' },
				  avatarUrl:{ type: 'string' }
				}
			  },
			  404: {
				type: 'object',
				properties: { error: { type: 'string' } }
			  }
			}
		  }
		},
		(req:FastifyRequest, reply:FastifyReply) => {
		  const { userId } = req.params as { userId: string };
		  const user = getUserById(userId);
		  if (!user) return reply.code(404).send({ error: 'User not found' });
	  
		  reply.send({
			userId:   user.userId,
			userName: user.userName,
			avatarUrl:user.avatarUrl ?? ''
		  });
		}
	  );


  fastify.patch('/:userId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
        },
        required: ['userId'],
      },
      body: {
        type: 'object',
        properties: {
          gameId: { type: 'string' },
        },
        required: ['gameId'],
      },
    },
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId: userId } = req.params as { userId: string };
      const { gameId } = req.body as { gameId: string };
  
      const userUpdate = await updateUserGameId(userId, gameId);
  
      return reply.send({ success: true, user: userUpdate });
    } catch (error) {
      console.error("Error updating user game ID:", error);
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  fastify.get('/dashboard', {
	  preHandler: [fastify.authenticate],
	  schema: {
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
				  role: { type: 'string' },
				  status: { type: 'string' },
				  avatarUrl: { type: 'string' }
			  }
			  },
			  stats: {
			  type: 'object',
			  properties: {
				  totalGames: { type: 'number' },
				  wins: { type: 'number' },
				  losses: { type: 'number' },
				  winRate: { type: 'number' }
			  }
			  },
			  matchHistory: {
			  type: 'array',
			  items: {
				  type: 'object',
				  properties: {
				  gameId: { type: 'string' },
				  gameType: { type: 'string' },
				  opponent: {
					  type: 'object',
					  properties: {
					  userId: { type: 'string' },
					  userName: { type: 'string' }
					  }
				  },
				  result: { type: 'string', enum: ['win', 'loss'] },
				  score: {
					  type: 'object',
					  properties: {
					  player: { type: 'number' },
					  opponent: { type: 'number' }
					  }
				  },
				  date: { type: 'string' }
				  }
			  }
			  }
		  }
		  }
	  }
	  }
  }, getUserDashboard);
  
}