import { FastifyRequest, FastifyReply, FastifySchema } from 'fastify';
import { attemptTournament, launchMatch, joinQueue1v1, joinTournamentQueue } from './matchmakingController.js';
import {  updateMatch, getMatchbyId, getTournamentById, scheduleFinal, finishTournament} from './matchmakingDb.js'

const playerIdSchema: FastifySchema = {
	body: {
	  type: 'object',
	  required: ['playerId'],
	  properties: {
		playerId: { type: 'number' },
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
		  winner_id: { type: 'number' }
		},
		required: ['score1', 'score2', 'winner_id']
	},
};

export default async function matchmakingRoutes(fastify: any) {
	fastify.post('/join', { schema: playerIdSchema }, async (request:FastifyRequest, reply:FastifyReply) => {
		const {playerId} = request.body as {playerId:number};
		const result = joinQueue1v1(playerId);
		reply.send(result);
	})
	fastify.post('/match/update/:matchId', { schema: UpdateMatchSchema }, async (request:FastifyRequest, reply:FastifyReply) => {
		const { matchId } = request.params as {matchId: string};
		const { score1, score2, winner_id } = request.body as {
		  score1: number;
		  score2: number;
		  winner_id: number;
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
	
		const {playerId} = request.body as {playerId:number};
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

}