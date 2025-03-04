import { FastifyRequest, FastifyReply } from 'fastify';
import { getGamebyId, saveGame } from './gameDb.js'

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
export async function startGame(req:FastifyRequest, reply:FastifyReply) {
	const { player1, player2 } = req.body as {player1: string, player2: string}
	const newGame = saveGame(player1, player2);
	reply.send({success: true, game: newGame});
}

// recuperer une partie
export async function getGame(req:FastifyRequest, reply:FastifyReply) {
	const { gameId } = req.params as {gameId: string};
	const game = getGamebyId(parseInt(gameId));
	if (!game) return reply.status(404).send({error: "Game not found"});
	reply.send(game);
}

//mettre a jour le score
export async function updateScore(req: FastifyRequest<{ Params: { gameId: string }; Body: { score1: number; score2: number } }>,
	reply: FastifyReply
) {
	const { gameId } = req.params as {gameId: string};
	const { score1, score2 } = req.body as { score1: number, score2:number }

	const game = getGamebyId(parseInt(gameId));
	if (!game) return reply.status(404).send({error: "Game not found"});
	// Vérifier que les scores sont bien des nombres
	if (typeof score1 !== 'number' || typeof score2 !== 'number') {
		return reply.status(400).send({ error: "Scores must be numbers" });
	}
	game.score1 = score1;
	game.score2 = score2;
	reply.send({success: true, game});
}

//terminer une partie
export async function endGame(req:FastifyRequest, reply:FastifyReply) {
	const { gameId } = req.params as {gameId: string}
	const game = getGamebyId(parseInt(gameId));
	if (!game) return reply.status(404).send({error: "Game not found"});
	if (game.score1 > game.score2) {
		game.winner = game.player1;
	} else if (game.score2 > game.score1) {
		game.winner = game.player1;
	} else {
		game.winner = "draw";
	}
	game.status = 'finished';
	reply.send({success: true, game});
}