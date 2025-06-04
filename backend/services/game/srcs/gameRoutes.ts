import { FastifyInstance, FastifyPluginOptions, FastifySchema } from "fastify";
import {
	startGame,
	getGame,
	getStatus,
	endOngoingGamesForfeit,
} from "./gameController.js";

const startGameSchema: FastifySchema = {
	body: {
		type: "object",
		required: ["player1_id", "player2_id"],
		properties: {
			player1_id: { type: "string" },
			player2_id: { type: "string" },
			matchId: { type: "string" },
		},
	},
};

const updateScoreSchema: FastifySchema = {
	body: {
		type: "object",
		required: ["score1", "score2"],
		properties: {
			score1: { type: "number" },
			score2: { type: "number" },
		},
	},
};

const forfeitGameSchema: FastifySchema = {
	body: {
		type: "object",
		required: ["winnerId"],
		properties: {
			winnerId: { type: "string", format: "uuid" },
		},
	},
	params: {
		type: "object",
		required: ["gameId"],
		properties: {
			gameId: { type: "string" },
		},
	},
};

export default async function gameRoutes(
	fastify: FastifyInstance,
	options: FastifyPluginOptions
) {
	fastify.post("/start", { schema: startGameSchema }, startGame);
	fastify.get("/:gameId", getGame);
	fastify.get("/:gameId/status", getStatus);
	fastify.patch(
		"/:gameId/forfeit",
		{ schema: forfeitGameSchema },
		endOngoingGamesForfeit
	);
}
