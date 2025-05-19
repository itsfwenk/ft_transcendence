import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { endGameInDb, getGamebyId, saveGame, updateGameScore, updateBallPositionInDb, getAllGamesId, updatePaddleDelta, updatePaddlesInDb, updateGameStatusInDb, endGameForfeitInDb } from './gameDb.js'
import { Ball } from '../gameInterfaces'
import axios from 'axios';
import { WebSocket } from "ws";
import jwt from 'jsonwebtoken';
import { isReturnStatement } from 'typescript';

// const canvasWidth = parseInt(process.env.CANVAS_WIDTH as string, 10);
// const canvasHeight = parseInt(process.env.CANVAS_HEIGHT as string, 10);
const paddleWidth = parseInt(process.env.PADDLE_WIDTH as string, 10);
const paddleHeight = parseInt(process.env.PADDLE_HEIGHT as string, 10);
const paddleSpeed = parseInt(process.env.PADDLE_SPEED as string, 10);
const ballRadius = parseInt(process.env.BALL_RADIUS as string, 10);
const speedIncrease = parseFloat(process.env.SPEED_INCREASE as string);

const activeUsers = new Map<string, WebSocket>(); // userId -> WebSocket
export default activeUsers;
const gameReadyPlayers = new Map<string, Set<string>>(); // gameId -> Set of userIds who are ready

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

function wait(ms: number) {
  return new Promise<void>(res => setTimeout(res, ms));
}

//demarrer une partie
export async function startGame(req: FastifyRequest<{ Body: { player1_id: string; player2_id: string; matchId?: string; delay?:number } }>, reply: FastifyReply) {
	const { player1_id, player2_id, matchId, delay = 0 } = req.body;
	//if (delay > 0) await wait(delay * 1_000);
	const player1 = await getUserById(player1_id);
	const player2 = await getUserById(player2_id);

	if (!player1) {
		return reply.status(400).send({error: "player 1 do not exist"})
	}
	if (!player2) {
		return reply.status(400).send({error: "player 2 do not exist"})
	}
    let newGame;
    newGame = saveGame(player1_id, player2_id, matchId);
	const gameId = { gameId: newGame.gameId };
	await updateUserGameId(player1_id, gameId);
	await updateUserGameId(player2_id, gameId);
	reply.send({ success: true, game: newGame });
}

// recuperer une partie
export async function getGame(req: FastifyRequest<{ Params: { gameId: string } }>, reply: FastifyReply) {
	const game = await getGamebyId(req.params.gameId);
	if (!game) return reply.status(404).send({ error: 'Game not found' });

	reply.send(game);
}

//mettre a jour le score
export async function updateScore(req: FastifyRequest<{ Params: { gameId: string }; Body: { score1: number; score2: number } }>, reply: FastifyReply) {
	const { gameId } = req.params as {gameId: string};
	const { score1, score2 } = req.body as { score1: number, score2:number }
	const game = await getGamebyId(gameId);
	if (!game) return reply.status(404).send({error: "Game not found"});
	// Vérifier que les scores sont bien des nombres
	if (typeof score1 !== 'number' || typeof score2 !== 'number') {
		return reply.status(400).send({ error: "Scores must be numbers" });
	}
	const updatedGame = updateGameScore(gameId, score1, score2);
	if (!updatedGame) return reply.status(500).send({ error: "Failed to update score" });
	reply.send({success: true, game: updatedGame});
}

//terminer une partie
export async function endGame(req:FastifyRequest<{ Params: { gameId: string } }>, reply:FastifyReply) {
	const { gameId } = req.params
	const updatedGame = endGameInDb(gameId);
	if (!updatedGame) return reply.status(404).send({error: "Game not found"});
	reply.send({success: true, updatedGame});
	//mise a jour du service matchmaking
	console.log("EndGame", updatedGame);
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

async function updateUserGameId(userId: string, gameId: Partial<{ gameId: string }>) {
	try {
	  console.log(`Updating user ${userId}`);
	  const baseUrl = process.env.USER_SERVICE_BASE_URL || 'http://user:4001';
	  const response = await axios.patch(`${baseUrl}/user/${userId}`, gameId);
	  return response.data;
	} catch (error) {
	  if (axios.isAxiosError(error)) {
		console.error(`❌ Axios error while updating user ${userId}:`, error.response?.data || error.message);
	  } else if (error instanceof Error) {
		console.error(`❌ Generic error while updating user ${userId}:`, error.message);
	  } else {
		console.error(`❌ Unknown error occurred`);
	  }
	  return null;
	}
  }

export async function updateBallPosition(gameId: string) {
	try {
		// console.log(`updateBallPosition called`);
		const game = await getGamebyId(gameId);
		if (!game) {
			console.error(`Game ${gameId} not found`);
			return;
		}
		if (game.status !== `ongoing`)
			return;
		// if (game.status === `finished`)
		// 	return;
		const ball: Ball = game.ball;
		ball.x += ball.dx;
		ball.y += ball.dy;
		// Check top-bottom collisions
		if (ball.y - ballRadius <= 0) {
			ball.dy *= -1;
			ball.y += 3;
		}
		else if (ball.y  + ballRadius >= game.canvasHeight) {
			ball.dy *= -1;
			ball.y -= 3;
		}

		// Check collision with paddles

		// let leftPaddle : Paddle | null | undefined = await getPaddle(gameId, `left`);
		// if (leftPaddle === null || leftPaddle === undefined)
		// 	console.error(`Error with left paddle`)
		let leftPaddle = game.leftPaddle;

		if (
			ball.x - ballRadius <= leftPaddle.x + paddleWidth &&
			ball.y >= leftPaddle.y && ball.y <= leftPaddle.y + paddleHeight
		) {
			let relativeIntersectY = ball.y - (leftPaddle.y + paddleHeight / 2);
			let normalizedIntersectY = relativeIntersectY / (paddleHeight / 2);
			
			ball.dx *= -1;
			ball.dy = normalizedIntersectY * Math.abs(ball.dx);
			ball.x += 2;
	
			ball.dx *= speedIncrease;
			ball.dy *= speedIncrease;
		}

		// let rightPaddle : Paddle | null | undefined = await getPaddle(gameId, `right`);
		// if (rightPaddle === null || rightPaddle === undefined)
		// 	console.error(`Error with right paddle`)
		let rightPaddle = game.rightPaddle;
		if (
			ball.x + ballRadius >= rightPaddle.x &&
			ball.y >= rightPaddle.y && ball.y <= rightPaddle.y + paddleHeight
		) {
			let relativeIntersectY = ball.y - (rightPaddle.y + paddleHeight / 2);
			let normalizedIntersectY = relativeIntersectY / (paddleHeight / 2);
			
			ball.dx *= -1;
			ball.dy = normalizedIntersectY * Math.abs(ball.dx);
			ball.x -= 2;
			ball.dx *= speedIncrease;
			ball.dy *= speedIncrease;
		}
		// console.log(ball.dx, ball.dy);
		// console.log(speedIncrease);
		if (ball.x < 0) {
			await updateGameScore(gameId, game.score1, game.score2 + 1);
			// game.score2++;
			resetBall();
		  } 
		else if (ball.x > game.canvasWidth) {
			await updateGameScore(gameId, game.score1 + 1, game.score2);
			// game.score1++;
			resetBall();
		  }
		function resetBall() {
			// console.log(`call resestBall`);
			if (game) {
				ball.x = game.canvasWidth / 2;
				ball.y = game.canvasHeight / 2;
				ball.dx = Math.random() > 0.5 ? 3 : -3;
				ball.dy = Math.random() > 0.5 ? 3 : -3;
			}
		  }
		// console.log(ball.x, ball.y, ball.dx, ball.dy);
		await updateBallPositionInDb(gameId, ball);
	}
	catch (error) {
		console.error("Error updating ball:", error);
	}
}

// async function getPaddle(gameId: string, side: string) {
// 	try {
// 		const game = await getGamebyId(gameId);
// 		if (!game) {
// 			console.error(`Game ${gameId} not found`);
// 			return;
// 		}
// 		if (side === `left`)
// 			return (game.leftPaddle);
// 		else (side === `right`)
// 			return (game.rightPaddle);
// 	} catch (error) {
// 		console.error(`❌ Error while retrieving paddle`);
// 		}
// 	  return null;
// }

export async function updateGames() {
	try {
		const allIds : {gameId: string }[] = await getAllGamesId();
		// console.log(`updateGames called`);
		await Promise.all(allIds.map(async (gameId) => {
		  updateBallPosition(gameId.gameId);
		  updatePaddlesInDb(gameId.gameId);
		  broadcastGameToPlayers(gameId.gameId);
		}));
	  } catch (error) {
		console.error('Error fetching games:', error);
		return;
	  }
}

// const JWT_SECRET = "secret_key";

async function markPlayerAsForfeit(quitterId : string): Promise<void> {
	const	user = await getUserById(quitterId);
	if (!user) return;
	const	game = await getGamebyId(user.inGameId);
	if (!game) return;

	const winnerId = game.player1_id === quitterId ? game.player2_id : game.player1_id;
	console.log("winnerID", winnerId);

	game.status = 'finished';
	game.winner_id = winnerId;
	endGameForfeitInDb(game);
}

export async function websocketHandshake(fastify: FastifyInstance, connection: WebSocket, req: FastifyRequest) {
	console.log('websocketHandshake called');

	// const token = req.unsignCookie["authToken"] as string;
	const { value: unsignedToken, valid } = req.unsignCookie(req.cookies["authToken"] as string);
	console.log(`token:`, unsignedToken);
	if (!unsignedToken)
		return
	const decoded = websocketAuthMiddleware(fastify, unsignedToken);
	// const decoded = fastify.jwt.verify(token) as JwtPayload;
	if (!decoded) {
		console.error('Error in websocketAuthMiddleware');
		connection.close(1003, 'Invalid message format');
		return;
	}
	const { userId } = decoded;
	const	user = await getUserById(userId);

	activeUsers.set(userId, connection);
	console.log(`User ${userId} connected via WebSocket`);

	const gameId = user.inGameId;
	if (!gameReadyPlayers.has(gameId)) {
        gameReadyPlayers.set(gameId, new Set<string>());
    }

    connection.on('message', async (message) => {
        try {
            // const { key, type } = JSON.parse(message.toString());
			// console.log(key, type);
            // if (!key || !type) {
            //     console.warn("Invalid message received:", message.toString());
            //     return;
            // }
			const parsedMessage = JSON.parse(message.toString());
            const { type, key, state } = parsedMessage;

			// if (type === 'canvas_size') {
			// 	const { width, height } = parsedMessage;
			// 	updateGameCanvas(gameId, width, height);
			// 	  console.log(`Game ${gameId} canvas size updated: ${width} x ${height}`);
			// 	updatePaddlesInDb(gameId);
			  if (type === 'ready_to_start') {
                console.log(`User ${userId} is ready to start game ${gameId}`);
                const readyPlayers = gameReadyPlayers.get(gameId)!;
                readyPlayers.add(userId);

                const game = await getGamebyId(gameId);
                if (game && readyPlayers.size === 2 && game.status !== 'ongoing') {
                    console.log(`Both players ready for game ${gameId}. Starting game.`);
                    await updateGameStatusInDb(gameId, 'ongoing');
                    for (const playerId of [game.player1_id, game.player2_id]) {
                        const playerSocket = activeUsers.get(playerId);
                        playerSocket?.send(JSON.stringify({ type: 'game_start' }));
                    }
                }
            }

            // if (key === 'ArrowUp') {
            //     if (type === "keydown") {
            //         updatePaddleDelta(user.inGameId, userId, -paddleSpeed);
            //     } else if (type === "keyup") {
            //         updatePaddleDelta(user.inGameId, userId, 0);
            //     }
            // } else if (key === 'ArrowDown') {
            //     if (type === "keydown") {
            //         updatePaddleDelta(user.inGameId, userId, paddleSpeed);
            //     } else if (type === "keyup") {
            //         updatePaddleDelta(user.inGameId, userId, 0);
            //     }
            // }
			else if (type === 'input' && key) {
                const delta = (key === 'ArrowUp') ? -paddleSpeed : (key === 'ArrowDown') ? paddleSpeed : 0;
                updatePaddleDelta(gameId, userId, state === 'keydown' ? delta : 0);
			}
			else if (type === 'FORFEIT') {
				markPlayerAsForfeit(userId);

			}
        } catch (err) {
            console.error("Error processing WebSocket message:", err);
            connection.close(1003, 'Invalid message format'); // Close with unsupported data error
        }
    });

	// Handle socket close
	connection.on('close', async () => {
		activeUsers.delete(userId);
		const readyPlayers = gameReadyPlayers.get(gameId);
		readyPlayers?.delete(userId);
		if (readyPlayers?.size === 0)
		{
			const updatedGame = endGameInDb(gameId);
			if (!updatedGame) 
			{
				console.error('game not found');
				return 
			}	
			//reply.send({success: true, updatedGame});
			//mise a jour du service matchmaking
			console.log("EndGame", updatedGame);
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
			console.log("Game", gameId, "has finished.");
			gameReadyPlayers.delete(gameId);
		}
		console.log(`User ${userId} disconnected`);
		connection.close(1003, 'Invalid message format');

	});

	connection.on('error', (err: Error) => {
		console.error('WebSocket error:', err.message);
		connection.close(1003, 'Invalid message format');
	  });
}

async function broadcastGameToPlayers(gameId: string) {
	const game = await getGamebyId(gameId);
	if (!game) return;

	[game.player1_id, game.player2_id].forEach(userId => {
		const gameSet = gameReadyPlayers.get(gameId);
		if (gameSet?.has(userId)) {
			const socket = activeUsers.get(userId);
			if (socket) {
				const message = {
                    type: 'game_update',
                    game_state: game,
                };
				// console.log("from broadcastGameToPlayers :", JSON.stringify(message));
				socket.send(JSON.stringify(message));
			}
		}
	});
}

interface JwtPayload {
	userId: string;
}

export function websocketAuthMiddleware(fastify: FastifyInstance, token: string) {
	try {
		// const token : string = req.query.token;

		if (!token)
			throw new Error("No token provided");

		const decoded = fastify.jwt.verify(token) as JwtPayload;
		return decoded;
		// if (decoded && typeof decoded === 'object' && 'userId' in decoded) {
		// 	const { userId, gameId } = decoded;
		// 	return { userId, gameId };
		// }
		// else
		// 	throw new Error("Invalid token payload");
	} catch (err) {
		console.error("Token verification failed:", err);
		return null;
	}
  }