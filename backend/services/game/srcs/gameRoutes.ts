import { FastifyInstance, FastifyPluginOptions, FastifySchema } from 'fastify';
import { startGame, getGame, updateScore, endGame } from './gameController.js'

//definir un schema pour 'start game'
const startGameSchema: FastifySchema = {
	body: {
	  type: 'object',
	  required: ['player1_id', 'player2_id'],
	  properties: {
		player1_id: { type: 'string' },
		player2_id: { type: 'string' }
	  }
	}
};

// Définir un schéma pour `/update-score`
const updateScoreSchema: FastifySchema = {
	body: {
	  type: 'object',
	  required: ['score1', 'score2'],
	  properties: {
		score1: { type: 'number' },
		score2: { type: 'number' }
	  }
	}
};

export default async function gameRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
	fastify.post('/start', { schema: startGameSchema}, startGame);
	fastify.get('/:gameId', getGame );
	fastify.put('/:gameId/score', { schema: updateScoreSchema }, updateScore);
	fastify.post('/:gameId/end', endGame);
}