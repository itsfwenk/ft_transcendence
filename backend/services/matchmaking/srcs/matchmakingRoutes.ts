import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginOptions, FastifySchema } from 'fastify';
import { joinQueue} from './matchmakingController.js';


export default async function matchmakingRoutes(fastify: any) {
  fastify.post('join', async (request:FastifyRequest, reply:FastifyReply) => {
	const {playerId} = request.body as {playerId:number};
	const result = joinQueue(playerId);
	reply.send(result);
  })
}