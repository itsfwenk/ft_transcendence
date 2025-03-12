import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginOptions, FastifySchema } from 'fastify';
import { joinQueue } from './matchmakingController.js';
import { updateTournamentMatch} from './matchmaking.js'


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
		const updatedMatch = updateTournamentMatch(matchId, score1, score2, winner_id);
  		reply.send({ success: true, updatedMatch });
	})
}