import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import gameRoutes from './gameRoutes.js';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import fastifyWebsocket from "@fastify/websocket";
import { updateGames } from './gameController.js'
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import { websocketHandshake } from './gameController.js';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';

// import Database from 'better-sqlite3';

const app: FastifyInstance = Fastify( {
	logger: true,
});

const activeUsers = new Map<number, WebSocket>(); // userId -> WebSocket
export default activeUsers;

app.register(fastifyJwt, {
	secret: process.env.JWT_SECRET!,
	cookie: {
	  cookieName: 'authToken',
	  signed: true,
	}
});

// app.decorate("authenticate", async function (req: FastifyRequest, reply: FastifyReply) {
// 	try {
// 	  await req.jwtVerify();
// 	} catch (err) {
// 	  reply.status(401).send({ error: "Unauthorized" });
// 	}
//   });

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

app.register(fastifyCookie, {
	secret: process.env.COOKIE_SECRET,
});

// app.register(cors, {
// 	origin: 'http://localhost:4001',
// 	credentials: true,
//   });



app.register(swaggerUI, {
  routePrefix: '/docs',
  staticCSP: true
});

//enregistrer les routes
app.register(gameRoutes, { prefix: '/game' });

app.register(async function (fastify) {
	fastify.get('/game/ws', { websocket: true }, (connection, req) => {
		console.log("Game Websocket route triggered");
		websocketHandshake(fastify, connection, req)
	});
});

let intervalId: ReturnType<typeof setInterval> = setInterval(updateGames, 16);

process.on("SIGINT", () => {
	console.log("Shutting down server...");
	clearInterval(intervalId);
	process.exit();
  });

app.listen({port: 4002 , host: '0.0.0.0'}, () => {
	console.log('game service runnin on http://localhost:4002');
});