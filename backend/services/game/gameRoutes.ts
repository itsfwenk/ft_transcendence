import { FastifyInstance, FastifyPluginOptions, FastifySchema } from 'fastify';
import { startGame, getGame, updateScore, endGame } from './gameController.js'


// Définir un schéma pour `/update-score`
const startGameSchema: FastifySchema = {
	body: {
	  type: 'object',
	  required: ['player1', 'player2'],
	  properties: {
		player1: { type: 'string' },
		player2: { type: 'string' }
	  }
	}
};

//definir un schema pour 'start game'
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
	fastify.post('/start', startGame);
	fastify.get('/:gameId', getGame );
	fastify.put('/:gameId/score', { schema: updateScoreSchema }, updateScore);
	fastify.post('/:gameId/end', endGame);
}