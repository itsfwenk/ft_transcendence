import Fastify, { FastifyInstance } from "fastify";
import gameRoutes from "./gameRoutes.js";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import fastifyWebsocket from "@fastify/websocket";
import { updateGames } from "./gameController.js";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import { websocketHandshake } from "./gameController.js";
import { ongoingGames } from "./gameController.js";
import { gamesInProgress } from "../metrics/gameMetrics.js";

const app: FastifyInstance = Fastify({
	logger: true,
});

const activeUsers = new Map<number, WebSocket>(); // userId -> WebSocket
export default activeUsers;

app.addHook("onRequest", (req, reply, done) => {
	if (req.url === "/metrics") {
		gamesInProgress.set(ongoingGames.size);
	}
	console.log("Global game request log:", req.method, req.url);
	done();
});

app.register(fastifyJwt, {
	secret: process.env.JWT_SECRET!,
	cookie: {
		cookieName: "authToken",
		signed: true,
	},
});

app.register(swagger, {
	swagger: {
		info: {
			title: "Game API",
			description: "API documentation for Game Service",
			version: "1.0.0",
		},
	},
});

app.register(fastifyWebsocket);

app.register(fastifyCookie, {
	secret: process.env.COOKIE_SECRET,
});

app.register(require("fastify-metrics"), { routeMetrics: true });

app.register(swaggerUI, {
	routePrefix: "/docs",
	staticCSP: true,
});

app.register(gameRoutes, { prefix: "/game" });

app.register(async function (fastify) {
	fastify.get("/game/ws", { websocket: true }, (connection, req) => {
		console.log("Game Websocket route triggered");
		websocketHandshake(fastify, connection, req);
	});
});

let intervalId: ReturnType<typeof setInterval> = setInterval(updateGames, 16);

process.on("SIGINT", () => {
	console.log("Shutting down server...");
	clearInterval(intervalId);
	process.exit();
});

app.listen({ port: 4002, host: "0.0.0.0" }, () => {
	console.log("game service runnin on http://localhost:4002");
});
