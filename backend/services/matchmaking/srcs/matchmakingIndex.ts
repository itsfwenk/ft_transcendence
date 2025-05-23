import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import matchmakingRoutes from './matchmakingRoutes.js';
import { WebSocket } from "ws";
import websocket from '@fastify/websocket';
import { websocketClients } from './matchmakingRoutes.js';
import { connectedUsers} from '../metrics/matchmakingMetrics.js'




const app = Fastify();

(async () => {
	app.register(websocket);
	
	app.register(require('fastify-metrics'), { routeMetrics:true });
	
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

	// Debug hook
	app.addHook('onRequest', (req, reply, done) => {
		if (req.url === '/metrics') {
			connectedUsers.set(websocketClients.size);
		}
		console.log('Global request log:', req.method, req.url);
		done();
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