import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginOptions, FastifySchema } from 'fastify';
import { joinQueue, joinTournamentQueue } from './matchmakingController.js';
import { updateMatch, getMatchbyId, getTournamentById, scheduleFinal} from './matchmakingDb.js'
import { launchMatch } from './matchmaking.js';

const JoinQueueSchema: FastifySchema = {
	body: {
	  type: 'object',
	  required: ['playerId'],
	  properties: {
		playerId: { type: 'number' },
	  }
	}
};

export default async function matchmakingRoutes(fastify: any) {
	fastify.post('/join', { schema: JoinQueueSchema }, async (request:FastifyRequest, reply:FastifyReply) => {
		const {playerId} = request.body as {playerId:number};
		const result = joinQueue(playerId);
		reply.send(result);
	})
	fastify.post('/match/update/:matchId', async (request:FastifyRequest, reply:FastifyReply) => {
		const { matchId } = request.params as {matchId: string};
		const { score1, score2, winner_id } = request.body as {
		  score1: number;
		  score2: number;
		  winner_id: number;
		};
		const updatedMatch = updateMatch(matchId, score1, score2, winner_id);
  		reply.send({ success: true, updatedMatch });
	})
	fastify.get('/tournament/match/:matchId', async (request:FastifyRequest<{ Params: { matchId: string } }>, reply:FastifyReply) => {
			const { matchId } = request.params as {matchId: string};
			const match = getMatchbyId(matchId);
			if (!match) return reply.status(404).send({ error: 'Match not found' });
		  
			reply.send(match);
	})
	fastify.post('/tournament/start', async (request:FastifyRequest, reply:FastifyReply) => {
		const { playerId } = request.body as { playerId: number};
		const startTournament = joinTournamentQueue(playerId);
  		reply.send({ success: true, startTournament });
	})
	fastify.get('/tournament/:tournamentId', async (request:FastifyRequest<{ Params: { tournamentId: string } }>, reply:FastifyReply) => {
		const { tournamentId } = request.params as {tournamentId: string};
		const tournament = getTournamentById(tournamentId);
		if (!tournament) return reply.status(404).send({ error: 'Tournament not found' });
		reply.send(tournament);
	})
	fastify.post('/tournament/match/start/:matchid', async (request:FastifyRequest<{ Params: { matchId: string } }>, reply:FastifyReply) => {
		const { matchId } = request.params as { matchId: string;};
		const Match = launchMatch(matchId);
  		reply.send({ success: true, Match });
	})
	fastify.post('/tournament/final/prepare', async (request:FastifyRequest, reply:FastifyReply) => {
		const { tournamentId } = request.body as { tournamentId: string};
		const prepare = scheduleFinal(tournamentId);
  		reply.send({ success: true, prepare });
	})








}