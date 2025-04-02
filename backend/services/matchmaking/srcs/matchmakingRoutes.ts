import { FastifyRequest, FastifyReply, FastifySchema } from 'fastify';
import { queue1v1, queueTournament, attemptTournament, launchMatch, joinQueue1v1, joinTournamentQueue } from './matchmakingController.js';
import {  updateMatch, getMatchbyId, getTournamentById, scheduleFinal, finishTournament, getMatchHistoryByUserId} from './matchmakingDb.js'
import { request } from 'axios';
import { WebSocket } from "ws";

export const websocketClients = new Map<string, WebSocket>(); //userId -> websocket

const playerIdSchema: FastifySchema = {
	body: {
	  type: 'object',
	  required: ['playerId'],
	  properties: {
		playerId: { type: 'string' },
	  }
	}
};

const tournamentIdSchema: FastifySchema = {
	params: {
	  type: 'object',
	  required: ['tournamentId'],
	  properties: {
		tournamentId: { type: 'string' },
	  }
	}
};

const matchIdSchema: FastifySchema = {
	params: {
		type: 'object',
		properties: {
		  matchId: { type: 'string' }
		},
		required: ['matchId']
	},
};

const UpdateMatchSchema: FastifySchema = {
	params: {
		type: 'object',
		properties: {
		  matchId: { type: 'string' }
		},
		required: ['matchId']
	  },
	body: {
		type: 'object',
		properties: {
		  score1: { type: 'number' },
		  score2: { type: 'number' },
		  winner_id: { type: 'string' }
		},
		required: ['score1', 'score2', 'winner_id']
	},
};

const queueStatusSchema: FastifySchema = {
	querystring: {
	  type: 'object',
	  properties: {
		type: { type: 'string', enum: ['1v1', 'tournament'] }
	  },
	  additionalProperties: false
	},
};

// YOYO
const userIdParamSchema: FastifySchema = {
	params: {
		type: 'object',
		properties: {
			userId: { type: 'string' }
		},
		required: ['userId']
	}
};
// END - YOYO

export default async function matchmakingRoutes(fastify: any) {
	fastify.post('/join', { schema: playerIdSchema }, async (request:FastifyRequest, reply:FastifyReply) => {
		const {playerId} = request.body as {playerId:string};
		const result = joinQueue1v1(playerId);
		reply.send(result);
	})
	fastify.get('/queue-status', {schema: queueStatusSchema}, async(request:FastifyRequest, reply:FastifyReply) => {
		const type = (request.query as { type: string }).type;
		if (type === 'tournament') {
			return reply.send({
				queueType: 'tournament',
				count: queueTournament.length,
			});
		} else if (type === '1v1') {
			return reply.send({
				queueType: '1v1',
				count: queue1v1.length,
			});
		}
	})
	fastify.post('/match/update/:matchId', { schema: UpdateMatchSchema }, async (request:FastifyRequest, reply:FastifyReply) => {
		const { matchId } = request.params as {matchId: string};
		const { score1, score2, winner_id } = request.body as {
		  score1: number;
		  score2: number;
		  winner_id: string;
		};
		const updatedMatch = updateMatch(matchId, score1, score2, winner_id);
  		reply.send({ success: true, updatedMatch });
	})
	fastify.get('/tournament/match/:matchId', { schema: matchIdSchema }, async (request:FastifyRequest<{ Params: { matchId: string } }>, reply:FastifyReply) => {
		const { matchId } = request.params as {matchId: string};
		const match = getMatchbyId(matchId);
		if (!match) return reply.status(404).send({ error: 'Match not found' });
		
		reply.send(match);
	})
	fastify.post('/tournament/join', { schema: playerIdSchema }, async(request:FastifyRequest, reply:FastifyReply) => {
	
		const {playerId} = request.body as {playerId:string};
		const result = joinTournamentQueue(playerId);
		reply.send({success: true, result});
	})
	fastify.post('/tournament/start', async (request:FastifyRequest, reply:FastifyReply) => {
		const startTournament = await attemptTournament();
  		reply.send({ success: true, tournament: startTournament });
	})
	fastify.get('/tournament/:tournamentId', { schema: tournamentIdSchema }, async (request:FastifyRequest<{ Params: { tournamentId: string } }>, reply:FastifyReply) => {
		const { tournamentId } = request.params as {tournamentId: string};
		const tournament = getTournamentById(tournamentId);
		if (!tournament) return reply.status(404).send({ error: 'Tournament not found' });
		reply.send(tournament);
	})
	fastify.post('/tournament/match/start/:matchId', { schema: matchIdSchema }, async (request:FastifyRequest<{ Params: { matchId: string } }>, reply:FastifyReply) => {
		const { matchId } = request.params as { matchId: string;};
		const match = await launchMatch(matchId); //revoir pourquoi await
  		reply.send({ success: true, Match: match });
	})
	fastify.post('/tournament/final/prepare/:tournamentId', { schema: tournamentIdSchema }, async (request:FastifyRequest, reply:FastifyReply) => {
		const { tournamentId } = request.params as { tournamentId: string};
		const prepare = scheduleFinal(tournamentId);
  		reply.send({ success: true, prepare });
	})
	fastify.post('/tournament/end/:tournamentId', { schema: tournamentIdSchema }, async (request:FastifyRequest, reply:FastifyReply) => {
		const { tournamentId } = request.params as {tournamentId: string};
		finishTournament(tournamentId);
  		reply.send({ success: true});
	})
// YOYO
	fastify.get('/history/:userId', { schema: userIdParamSchema }, async (req: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
		const { userId } = req.params;

		try {
			const matchHistory = getMatchHistoryByUserId(userId);
			reply.send(matchHistory);
		} catch (error) {
			console.error('Error fetching match history:', error);
			reply.status(500).send({ error: 'Failed to fetch match history '});
		}
	});
// END - YOYO
	fastify.get('/ws', { websocket: true }, (connection: WebSocket, request: FastifyRequest) => {
		const { playerId } = request.query as { playerId?: string };
		console.log('Query params:', request.query);
		if (!playerId) {
			console.error("playerId non fourni, fermeture de la connexion");
			connection.close();
			return;
		}

		 // Vérifier si une connexion existe déjà pour ce playerId
		 if (websocketClients.has(playerId)) {
			console.warn(`Une connexion existe déjà pour le playerId: ${playerId}. Fermeture de la nouvelle connexion.`);
			connection.close();
			return;
		  }

		connection.on('message', (msg) => {
			console.log('📩 Message reçu :', msg.toString());
		});
		console.log(`Un client WebSocket est connecté pour le playerId: ${playerId}`);
		// Stocker la connexion dans la Map avec le playerId comme clé
		websocketClients.set(playerId, connection);
	  
		connection.on('close', () => {
		  console.log(`Un client WebSocket s'est déconnecté pour le playerId: ${playerId}`);
		  websocketClients.delete(playerId);
		});
	});
}
