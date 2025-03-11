import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginOptions, FastifySchema } from 'fastify';
import { joinQueue} from './matchmakingController.js';


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
}