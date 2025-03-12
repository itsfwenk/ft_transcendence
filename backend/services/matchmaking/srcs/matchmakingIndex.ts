import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import matchmakingRoutes from './matchmakingRoutes.js';

const app = Fastify();

// Configurer Swagger
app.register(swagger, {
  swagger: {
    info: {
      title: 'Matchmaking API',
      description: 'API documentation for User Service',
      version: '1.0.0'
    }
  }
});

app.register(swaggerUI, {
  routePrefix: '/docs',
  staticCSP: true
});

//Register bcrypt




// Enregistrer les routes utilisateur
app.register(matchmakingRoutes, { prefix: '/matchmaking' });

app.listen({port: 4003 , host: '0.0.0.0'}, () => {
	console.log('Matchmaking Service running on http://localhost:4003');
});

