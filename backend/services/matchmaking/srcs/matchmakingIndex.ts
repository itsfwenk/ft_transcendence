import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import matchmakingRoutes from './matchmakingRoutes.js';
import { WebSocket } from "ws";
import websocket from '@fastify/websocket';
import { handleMatchmakingMessage } from './matchmakingController';



const app = Fastify();

(async () => {
	app.register(websocket);
	
	
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

	// Enregistrer les routes utilisateur
	app.register(matchmakingRoutes, { prefix: '/matchmaking' });

	app.listen({port: 4003 , host: '0.0.0.0'}, () => {
		console.log('Matchmaking Service running on http://localhost:4003');
	});
})();