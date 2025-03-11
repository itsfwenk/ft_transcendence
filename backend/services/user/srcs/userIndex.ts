import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import userRoutes from './userRoutes.js';
import dotenv from 'dotenv'

const app = Fastify();

dotenv.config();

// Configurer JWT
app.register(jwt, { secret: process.env.JWT_SECRET || 'fallback_secret' });

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

// Middleware pour vérifier l'authentification
app.decorate("authenticate", async function (req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: "Unauthorized" });
  }
});

// Enregistrer les routes utilisateur
app.register(userRoutes, { prefix: '/user' });

app.listen({port: 4001 , host: '0.0.0.0'}, () => {
	console.log('User Service running on http://localhost:4001');
});