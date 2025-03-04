import Fastify, { FastifyInstance } from 'fastify';
import gameRoutes from './gameRoutes.js';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import formbody from '@fastify/formbody';

const app: FastifyInstance = Fastify();

app.register(gameRoutes, {prefix: '/game' });

app.register(swagger, {
	swagger: {
		info: {
		  title: 'User API',
		  description: 'API documentation for User Service',
		  version: '1.0.0'
		},
	}
})

app.register(formbody);


app.register(swaggerUI, {
  routePrefix: '/docs'
});

app.listen({port: 4002 }, () => {
	console.log('game service runnin on http:://localhost:4002');
});