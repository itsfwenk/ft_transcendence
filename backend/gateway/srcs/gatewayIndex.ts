import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import userProxy from './proxies/userProxy.js';
import gameProxy from './proxies/gameProxy.js';
import matchmakingProxy from './proxies/matchmakingProxy.js';
import cors from '@fastify/cors';
import fastifyWebsocket from '@fastify/websocket';

const app = Fastify();

app.register(fastifyWebsocket);

//Configurer Swagger UI
app.register(swagger,{
	swagger: {
		info: {
			title: 'API Gateway',
			description: 'Doc des services User et Game',
			version: '1.0.0'
		}
	}
});

app.register(cors, {
	origin: 'http://localhost:5173', // ou '*' pour autoriser toutes les origines (pas recommandé en prod)
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	
});

app.register(swaggerUI, {
	routePrefix: '/docs',
	staticCSP: true
});

//Enregistrer les proxy pour User et Game
app.register(userProxy);
app.register(gameProxy);
app.register(matchmakingProxy);

app.listen({port: 4000 , host: '0.0.0.0'}, () => {
	console.log('API Gateway running on http://localhost:4000');
});