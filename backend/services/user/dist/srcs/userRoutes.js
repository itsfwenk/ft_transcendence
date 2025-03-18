"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = userRoutes;
const userController_js_1 = require("./userController.js");
const User = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        userName: { type: 'string' },
        email: { type: 'string' },
    },
};
async function userRoutes(fastify) {
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
        handler: userController_js_1.registerUser
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
        handler: userController_js_1.loginUser
    });
    fastify.get('/profile', {
        preHandler: [fastify.authenticate], // Protection avec JWT
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
                        id: { type: 'number' },
                        userName: { type: 'string' },
                        email: { type: 'string' }
                    }
                }
            }
        }
    }, userController_js_1.getUserProfile);
    fastify.get("/:userId", userController_js_1.getUserByIdController);
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
    }, userController_js_1.updateProfile);
    fastify.delete('/profile', {
        preHandler: [fastify.authenticate],
        handler: userController_js_1.deleteAccount
    });
}
