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
import websocket from '@fastify/websocket';
import { handleWebSocketConnection } from './WebsocketHandler.js';


const app = Fastify();

dotenv.config();

app.register(fastifyCookie);

// Configurer JWT
//app.register(jwt, { secret: 'supersecretkey' });

app.register(jwt, {
	secret: 'supersecretkey',
	cookie: {
	  cookieName: 'authToken',
	  signed: false,
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

interface IsAdminRequest extends FastifyRequest {
	user: { role: string };
}

// Middleware pour verif admin et jwt
app.decorate("isAdmin", async function (req: IsAdminRequest, reply: FastifyReply) {
	try {
	  await req.jwtVerify();
	  if (req.user.role !== 'admin') {
		reply.status(403).send({ error: "Permission denied" });
	  }
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

app.listen({port: 4001 , host: '0.0.0.0'}, () => {
	console.log('User Service running on http://localhost:4001');
});

app.get('/avatars/:filename', (request, reply) => {
	const { filename } = request.params as { filename: string };
	const avatarsDir = '/app/public/avatars';
	const filePath = path.join(avatarsDir, filename);

	fs.access(filePath, fs.constants.F_OK, (err) => {
		if (err) {
			return (reply as any).sendFile('default.png', avatarsDir);
		}
		(reply as any).sendFile(filename, avatarsDir);
	});
});

