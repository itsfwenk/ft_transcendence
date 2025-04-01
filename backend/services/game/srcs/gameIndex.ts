import Fastify, { FastifyInstance } from 'fastify';
import gameRoutes from './gameRoutes.js';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import fastifyWebsocket from "@fastify/websocket";
import { updateGames } from './gameController.js'
import fastifyCookie from '@fastify/cookie';
import cors from '@fastify/cors';

// import Database from 'better-sqlite3';

const app: FastifyInstance = Fastify( {
	logger: true,
});

const activeUsers = new Map<number, WebSocket>(); // userId -> WebSocket
export default activeUsers;


app.register(swagger, {
	swagger: {
		info: {
		  title: 'Game API',
		  description: 'API documentation for Game Service',
		  version: '1.0.0'
		},
	}
});

app.register(fastifyWebsocket);

app.register(fastifyCookie);

app.register(cors, {
	origin: 'http://localhost:4001',
	credentials: true,
  });



app.register(swaggerUI, {
  routePrefix: '/docs',
  staticCSP: true
});

//enregistrer les routes
app.register(gameRoutes, { prefix: '/game' });

let intervalId: ReturnType<typeof setInterval> = setInterval(updateGames, 16);

process.on("SIGINT", () => {
	console.log("Shutting down server...");
	clearInterval(intervalId);
	process.exit();
  });

app.listen({port: 4002 , host: '0.0.0.0'}, () => {
	console.log('game service runnin on http://localhost:4002');
});