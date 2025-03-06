import { FastifyRequest, FastifyReply } from 'fastify';
import { endGameInDb, getGamebyId, saveGame, updateGameScore } from './gameDb.js'
import axios from 'axios';

/*
// Interface pour le body de startGame
interface GameRequest extends FastifyRequest {
	body: {
		player1:string;
		player2:string;
	};
}

// Interface pour le body de updateScore
interface ScoreUpdateRequest extends FastifyRequest {
	body: {
	  score1: number;
	  score2: number;
	};
}

// Interface pour `endGame`
interface EndGameRequest extends FastifyRequest {
	params: {
	  gameId: string;
	};
}
*/

//demarrer une partie
export async function startGame(req: FastifyRequest<{ Body: { player1_id: number; player2_id: number } }>, reply: FastifyReply) {
	const { player1_id, player2_id } = req.body;
	const player1 = await getUserById(player1_id);
	const player2 = await getUserById(player2_id);

	if (!player1 || !player2) {
		return reply.status(400).send({error: "One or both players do not exist"})
	}
	const newGame = saveGame(player1_id, player2_id);
	reply.send({ success: true, game: newGame });
}

// recuperer une partie
export async function getGame(req: FastifyRequest<{ Params: { gameId: string } }>, reply: FastifyReply) {
	const game = getGamebyId(parseInt(req.params.gameId));
	if (!game) return reply.status(404).send({ error: 'Game not found' });
  
	reply.send(game);
}

//mettre a jour le score
export async function updateScore(req: FastifyRequest<{ Params: { gameId: string }; Body: { score1: number; score2: number } }>, reply: FastifyReply) {
	const { gameId } = req.params as {gameId: string};
	const { score1, score2 } = req.body as { score1: number, score2:number }

	const game = getGamebyId(parseInt(gameId));
	if (!game) return reply.status(404).send({error: "Game not found"});
	// Vérifier que les scores sont bien des nombres
	if (typeof score1 !== 'number' || typeof score2 !== 'number') {
		return reply.status(400).send({ error: "Scores must be numbers" });
	}
	const updatedGame = updateGameScore(parseInt(gameId), score1, score2);
	if (!updatedGame) return reply.status(500).send({ error: "Failed to update score" });
	reply.send({success: true, game: updatedGame});
}

//terminer une partie
export async function endGame(req:FastifyRequest<{ Params: { gameId: string } }>, reply:FastifyReply) {
	const { gameId } = req.params
	const updatedGame = endGameInDb(parseInt(gameId));
	if (!updatedGame) return reply.status(404).send({error: "Game not found"});
	reply.send({success: true, updatedGame});
}

async function getUserById(userId: number) {
	try {
	  const response = await axios.get(`http://localhost:4001/user/${userId}`);
	  return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error(`❌ Erreur Axios lors de la récupération de l'utilisateur ${userId}:`, error.response?.data || error.message);
		} else if (error instanceof Error) {
			console.error(`❌ Erreur générique lors de la récupération de l'utilisateur ${userId}:`, error.message);
		} else {
			console.error(`❌ Une erreur inconnue est survenue`);
		}
	  return null;
	}
}
