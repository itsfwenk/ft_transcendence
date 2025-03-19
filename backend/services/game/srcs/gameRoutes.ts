import { FastifyInstance, FastifyPluginOptions, FastifySchema } from 'fastify';
import { startGame, getGame, updateScore, endGame, websocketHandshake } from './gameController.js'

//definir un schema pour 'start game'
const startGameSchema: FastifySchema = {
	body: {
	  type: 'object',
	  required: ['player1_id', 'player2_id'],
	  properties: {
		player1_id: { type: 'number' },
		player2_id: { type: 'number' }
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

const websocketSchema: FastifySchema = {
	querystring: {
	  type: 'object',
	  required: ['token'],
	  properties: {
		token: { type: 'string' }
	  },
	}
};

export default async function gameRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
	fastify.post('/start', { schema: startGameSchema}, startGame);
	fastify.get('/:gameId', getGame );
	fastify.put('/:gameId/score', { schema: updateScoreSchema }, updateScore);
	fastify.post('/:gameId/end', endGame);
	fastify.get('/game/ws', { websocket: true, schema: websocketSchema }, websocketHandshake);
}