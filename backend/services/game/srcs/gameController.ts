import { FastifyRequest, FastifyReply } from 'fastify';
import { endGameInDb, getGamebyId, saveGame, updateGameScore } from './gameDb.js'
import { Ball, Paddle, Game } from './gameDb.js'
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
export async function startGame(req: FastifyRequest<{ Body: { player1_id: string; player2_id: string; matchId?: string } }>, reply: FastifyReply) {
	const { player1_id, player2_id, matchId } = req.body;
	const player1 = await getUserById(player1_id);
	const player2 = await getUserById(player2_id);

	if (!player1) {
		return reply.status(400).send({error: "player 1 do not exist"})
	}
	if (!player2) {
		return reply.status(400).send({error: "player 2 do not exist"})
	}
    let newGame;
    if (matchId) {
        newGame = saveGame(player1_id, player2_id, matchId);
    } else {
        newGame = saveGame(player1_id, player2_id);
    }	reply.send({ success: true, game: newGame });
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
	//mise a jour du service matchmaking
	if (updatedGame.matchId) {
		try {
			const baseUrl = process.env.MATCHMAKING_SERVICE_BASE_URL || 'http://matchmaking:4003';
			const response = await axios.post(`${baseUrl}/matchmaking/match/update/${updatedGame.matchId}`, {
				matchId: updatedGame.matchId,
				score1: updatedGame.score1,
				score2: updatedGame.score2,
				winner_id: updatedGame.winner_id
			});
		} catch (error) {
			console.error('Erreur lors de la mise à jour du matchmaking:', error);
		}
	}
}

async function getUserById(userId: string) {
	try {
		console.log(userId);
		const baseUrl = process.env.USER_SERVICE_BASE_URL || 'http://user:4001';
		const response = await axios.get(`${baseUrl}/user/${userId}`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error(`Erreur Axios lors de la récupération de l'utilisateur ${userId}:`, error.response?.data || error.message);
		} else if (error instanceof Error) {
			console.error(`Erreur générique lors de la récupération de l'utilisateur ${userId}:`, error.message);
		} else {
			console.error(`Une erreur inconnue est survenue`);
		}
	  return null;
	}
}

export async function updateBallPosition(gameId: number) {
	try {
		const game = getGamebyId(gameId);
		if (!game) {
			console.error(`Game ${gameId} not found`);
			return;
		}
		const ball: Ball = game.ball;
		ball.x += ball.dx;
		ball.y += ball.dy;
		if (ball.y <= 0 || ball.y >= parseInt(process.env.CANVAS_HEIGHT as string, 10)) {
			ball.dy *= -1;
		}
	}
	catch (error) {
		console.error("Error updating ball:", error);
	}
}