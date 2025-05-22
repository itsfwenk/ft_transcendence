import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import jwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import userRoutes from './userRoutes.js';
import dotenv from 'dotenv'
import googleAuthRoutes from './googleAuthRoutes.js';
import path from 'path';
import fs from 'fs';
import fastifyCors from '@fastify/cors';

import websocket from '@fastify/websocket';
import { handleWebSocketConnection } from './WebsocketHandler.js';
import fastifyStatic from '@fastify/static';
import { getAllUserId, updateUserStatus } from './userDb.js';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const app = Fastify({
  maxParamLength: 1000000,
});

// dotenv.config();
// app.register(fastifyCors, {
// 	origin: true, // allow all origins dynamically
// 	credentials: true
//   });

app.register(fastifyCookie, {
	secret: process.env.COOKIE_SECRET,
});

app.register(fastifyStatic, {
	root: '/app/public/avatars',
	prefix: '/avatars/',
	decorateReply: false
});

// app.register(cors, {
// 	origin:  process.env.CORS_ORIGIN,
// 	credentials: true, // Allow sending/receiving cookies
//   });

// app.register(cors, {
// 	origin: '*',  // Allow all origins (adjust for production)
// 	methods: ['GET', 'POST', 'PUT', 'DELETE'],
// 	allowedHeaders: ['Content-Type', 'Authorization'],
// 	credentials: true, // Allow cookies or authorization headers to be sent
//   });

// Configurer JWT
//app.register(jwt, { secret: 'supersecretkey' });

app.register(jwt, {
	secret: process.env.JWT_SECRET!,
	cookie: {
	  cookieName: 'authToken',
	  signed: true,
	}
});

// Configurer Swagger
app.register(swagger, {
  swagger: {
    info: {
      title: 'User API',
      description: 'API documentation for User Service',
      version: '1.0.0'
    }
  }
});
app.register(require('fastify-metrics'), { routeMetrics:true });

app.register(swaggerUI, {
  routePrefix: '/docs',
  staticCSP: true
});

// Middleware pour jwt
app.decorate("authenticate", async function (req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: "Unauthorized" });
  }
});

// Enregistrer les routes utilisateur et google
app.register(userRoutes, { prefix: '/user' });

app.register(googleAuthRoutes, { prefix: '/user' });

app.register(websocket);

app.register(async function (fastify) {
	fastify.get('/ws', { websocket: true }, (connection, req) => {
		handleWebSocketConnection(fastify, connection, req);
	});
});

// Debug hook
app.addHook('onRequest', (req, reply, done) => {
    console.log('Global request log:', req.method, req.url);
    done();
});

app.listen({port: 4001 , host: '0.0.0.0'}, () => {
	console.log('User Service running on http://localhost:4001');
});

// app.addHook('onRequest', async (req, reply) => {
// 	console.log('Incoming cookies:', req.cookies);
// });

app.addHook('onReady', async function () {
  const userIds = await getAllUserId() as Array<{ userId: string }>;
  for (const row of userIds) {
    console.log('disconnecting :', row);
    updateUserStatus(row.userId as string, 'offline');
  }
})