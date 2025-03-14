import Fastify from 'fastify';
import gameRoutes from './gameRoutes.js';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import fastifyWebsocket from "@fastify/websocket";
import { endGameInDb, getGamebyId, saveGame, updateGameScore } from './gameDb.js'
import Database from 'better-sqlite3';

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

app.register(fastifyWebsocket);

app.register(swaggerUI, {
  routePrefix: '/docs',
  staticCSP: true
});

//enregistrer les routes
app.register(gameRoutes, { prefix: '/game' });

let intervalId: ReturnType<typeof setInterval> = setInterval(() => {



}, 16);

process.on("SIGINT", () => {
	console.log("Shutting down server...");
	clearInterval(intervalId);
	process.exit();
  });

app.listen({port: 4002 , host: '0.0.0.0'}, () => {
	console.log('game service runnin on http://localhost:4002');
});