import Fastify from 'fastify';
import gameRoutes from './gameRoutes.js';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

const app = Fastify();

app.register(swagger, {
	swagger: {
		info: {
		  title: 'User API',
		  description: 'API documentation for Game Service',
		  version: '1.0.0'
		},
	}
});


app.register(swaggerUI, {
  routePrefix: '/docs',
  staticCSP: true
});

//enregistrer les routes
app.register(gameRoutes, { prefix: '/game' });

app.listen({port: 4002 }, () => {
	console.log('game service runnin on http://localhost:4002');
});