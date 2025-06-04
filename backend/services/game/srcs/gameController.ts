import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getGamebyId, getGameCount, saveGameInDb, updateGameInDb } from './gameDb.js'
import { Game, Ball, Paddle } from '../gameInterfaces'
import axios from 'axios';
import { WebSocket } from "ws";

const canvasWidth = parseInt(process.env.CANVAS_WIDTH as string, 10);
const canvasHeight = parseInt(process.env.CANVAS_HEIGHT as string, 10);
const paddleWidth = parseInt(process.env.PADDLE_WIDTH as string, 10);
const paddleHeight = parseInt(process.env.PADDLE_HEIGHT as string, 10);
const paddleSpeed = parseInt(process.env.PADDLE_SPEED as string, 10);
const ballRadius = parseInt(process.env.BALL_RADIUS as string, 10);
const speedIncrease = parseFloat(process.env.SPEED_INCREASE as string);
const ballInitialSpeed: number = parseInt(process.env.BALL_SPEED as string, 10) || 5

const activeUsers = new Map<string, WebSocket>(); // userId -> WebSocket
export default activeUsers;
const gameReadyPlayers = new Map<string, Set<string>>(); // gameId -> Set of userIds who are ready

export const ongoingGames = new Map<string, Game>(); // gameId -> Game

function createPaddle(side: string) {
	let newPaddle : Paddle;
	if (side === `left`) {
		newPaddle = {
			x: 0,
			y: canvasHeight / 2 - paddleHeight / 2,
			dy:0,
		}
	}
	else {
		newPaddle = {
			x: canvasWidth - 10,
			y: canvasHeight / 2 - paddleHeight / 2,
			dy:0,
		}
	}
	return newPaddle;
}

function createBall() {
	let angle = (Math.random() * Math.PI / 2) - Math.PI / 4;
	if (Math.random() > 0.5) {
		angle += Math.PI;
	}
	let newBall : Ball = {
			x: canvasWidth / 2,
			y: canvasHeight / 2,
			radius: ballRadius,
			dx: Math.cos(angle) * ballInitialSpeed,
			dy: Math.sin(angle) * ballInitialSpeed,
		}
	return newBall;
}

function wait(ms: number) {
  return new Promise<void>(res => setTimeout(res, ms));
}

export async function startGame(req: FastifyRequest<{ Body: { player1_id: string; player2_id: string; matchId?: string;} }>, reply: FastifyReply) {
	const { player1_id, player2_id, matchId} = req.body;
	const player1 = await getUserById(player1_id);
	const player2 = await getUserById(player2_id);

	if (!player1) {
		return reply.status(400).send({error: "player 1 do not exist"})
	}
	if (!player2) {
		return reply.status(400).send({error: "player 2 do not exist"})
	}
    let newGame : Game = {
		gameId: (await getGameCount() + 1).toString(),
		player1_id: player1_id,
		player2_id: player2_id,
		score1: 0,
		score2: 0,
		leftPaddle: createPaddle(`left`),
		rightPaddle: createPaddle(`right`),
		ball: createBall(),
		status: 'waiting',
		winner_id: null,
		matchId:  null,
		canvasWidth: canvasWidth,
		canvasHeight: canvasHeight,
	}
    if (matchId) {
        newGame.matchId = matchId;
    }
	saveGameInDb(newGame);
	console.log('NEW GAME IS NUMBER :', newGame.gameId)
	ongoingGames.set(newGame.gameId, newGame);
	if (ongoingGames.has(newGame.gameId))
		console.log('new game in ongoingGames')
	await updateUserGameId(player1_id, newGame.gameId);
	await updateUserGameId(player2_id, newGame.gameId);
	reply.send({ success: true, game: newGame });
}

export async function getGame(req: FastifyRequest<{ Params: { gameId: string } }>, reply: FastifyReply) {
	const game = await getGamebyId(req.params.gameId);
	if (!game) return reply.status(404).send({ error: 'Game not found' });
	reply.send(game);
}

export async function getStatus(req: FastifyRequest<{ Params: { gameId: string } }>, reply: FastifyReply) {

  const game = await getGamebyId(req.params.gameId);
  if (!game) return reply.code(404).send({ error: 'Game not found' });
  return { status: game.status };
};

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

async function updateUserGameId(userId: string, gameId: string) {
	try {
	  console.log(`Updating user ${userId}`);
	  const gameIdObj = {
		gameId: gameId,
	  }
	  const baseUrl = process.env.USER_SERVICE_BASE_URL || 'http://user:4001';
	  const response = await axios.patch(`${baseUrl}/user/${userId}`, gameIdObj);
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

export async function updateGameScore(gameId: string, score1: number, score2: number) {
	const game = ongoingGames.get(gameId);
	if (!game) {
		console.error(`Game ${gameId} not found`);
		return;
	}
	if (score1 < 5 && score2 < 5) {
		game.score1 = score1;
		game.score2 = score2;
		game.status = 'ongoing';
	}
	else {
		console.log("game finished in updateGameScore")
		game.score1 = score1;
		game.score2 = score2;
		game.status = 'finished';
	}
}

export async function updateBallPosition(gameId: string) {
	try {
		const game = ongoingGames.get(gameId);
		if (!game) {
			console.error(`Game ${gameId} not found`);
			return;
		}
		if (game.status !== `ongoing`)
			return
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

		if (ball.x < 0) {
			await updateGameScore(gameId, game.score1, game.score2 + 1);
			resetBall();
		  } 
		else if (ball.x > game.canvasWidth) {
			await updateGameScore(gameId, game.score1 + 1, game.score2);
			resetBall();
		  }
		function resetBall() {
			ball.x = canvasWidth / 2;
			ball.y = canvasHeight / 2;

			let angle = (Math.random() * Math.PI / 2) - Math.PI / 4;
			if (Math.random() > 0.5) {
				angle += Math.PI;
			}
			ball.dx = Math.cos(angle) * ballInitialSpeed;
			ball.dy = Math.sin(angle) * ballInitialSpeed;
			ball.radius = ballRadius;
		}
	}
	catch (error) {
		console.error("Error updating ball:", error);
	}
}

export async function updatePaddles(gameId: string) {
	try {
			const game = ongoingGames.get(gameId);
			if (!game) {
				console.error(`Game ${gameId} not found`);
				return;
			}
			if (game.leftPaddle && game.rightPaddle) {
				game.leftPaddle.y = game.leftPaddle.y + game.leftPaddle.dy;
				game.rightPaddle.y = game.rightPaddle.y + game.rightPaddle.dy;

				game.leftPaddle.y = Math.max(0, Math.min(game.canvasHeight - paddleHeight, game.leftPaddle.y));
				game.rightPaddle.y = Math.max(0, Math.min(game.canvasHeight - paddleHeight, game.rightPaddle.y));
			}
	} catch (err) {
	  console.error('Error updating paddles:', err);
	}
}

export async function updateGames() {
	try {

		for(let gameId of ongoingGames.keys()) {
		  updateBallPosition(gameId);
		  updatePaddles(gameId);
		  broadcastGameToPlayers(gameId);
		};
	  } catch (error) {
		console.error('Error fetching games:', error);
		return;
	  }
}

async function markPlayerAsForfeit(quitterId : string): Promise<void> {
	const	user = await getUserById(quitterId);
	if (!user) return;
	const	game = ongoingGames.get(user.inGameId.toString());
	if (!game) return;

	const winnerId = game.player1_id === quitterId ? game.player2_id : game.player1_id;
	console.log("winnerID", winnerId);

	game.status = 'finished';
	game.winner_id = winnerId;
}

export async function updatePaddleDeltaInOngoingGames(gameId: string, playerId: string, delta: number) {
	try {
		const	game = ongoingGames.get(gameId.toString());
		if (game) {
			if (playerId === game.player1_id) {
				game.leftPaddle.dy = delta;
			}
			else {
				game.rightPaddle.dy = delta;
			}
		}
		else {
			console.log('game is', game, 'for gameId :', gameId);
		}
	} catch (err) {
		console.error('Error updating paddle delta:', err);
	}
}

export function endGameInOngoingGames(gameId: string) {
	const game = ongoingGames.get(gameId.toString());
	if (!game) {
		console.log('NO GAME FOUND IN endGameInOngoingGames');
		return;
	}
	console.log("endGameInOngoingGames game", game);
	if (game.status !== 'finished' || game.winner_id === null) {
		let winner_id: string | null = null;
		if (game.score1 > game.score2) winner_id = game.player1_id;
		else if (game.score2 > game.score1) winner_id = game.player2_id;
		game.status = 'finished';
		game.winner_id = winner_id;
	}
	if (game.status === 'finished' && game.winner_id != null) {
		console.log("endgameongoinggames finihed winner ID", game);
		updateGameInDb(game);
		console.log('ongoingGames size :', ongoingGames.size);
		return game;
	}
}

export async function websocketHandshake(fastify: FastifyInstance, connection: WebSocket, req: FastifyRequest) {
	console.log('websocketHandshake called');

	const { value: unsignedToken, valid } = req.unsignCookie(req.cookies["authToken"] as string);
	console.log(`token:`, unsignedToken);
	if (!unsignedToken)
		return
	const decoded = websocketAuthMiddleware(fastify, unsignedToken);
	if (!decoded) {
		console.error('Error in websocketAuthMiddleware');
		connection.close(1003, 'Invalid message format');
		return;
	}
	const { userId } = decoded;
	const	user = await getUserById(userId);
    endedAt: new Date(),
	activeUsers.set(userId, connection);
	console.log(`User ${userId} connected via WebSocket`);

	const gameId = user.inGameId;
	if (!gameReadyPlayers.has(gameId.toString())) {
        gameReadyPlayers.set(gameId.toString(), new Set<string>());
    }

    connection.on('message', async (message) => {
        try {
			const parsedMessage = JSON.parse(message.toString());
            const { type, key, state } = parsedMessage;
			  if (type === 'ready_to_start') {
                console.log(`User ${userId} is ready to start game ${gameId}`);
                const readyPlayers = gameReadyPlayers.get(gameId.toString())!;
                readyPlayers.add(userId);
                const game = ongoingGames.get(gameId.toString());
				if (game && readyPlayers.size === 1) {
					let missingUser;
					let waitingUser;
					if ([...readyPlayers.values()][0] === game.player1_id){
						waitingUser = game.player1_id;
						missingUser = game.player2_id;
					} else {
						waitingUser = game.player2_id;
						missingUser = game.player1_id;
					}
					if (activeUsers.get(missingUser) === undefined) {
						game.status = 'finished';
						game.winner_id = waitingUser;
						endGameInOngoingGames(gameId);
						console.log(`Player ${missingUser} is missing`);
					}
				}

                if (game && readyPlayers.size === 2 && game.status !== 'ongoing') {
                    console.log(`Both players ready for game ${gameId}. Starting game.`);
					game.status = 'ongoing';
                    for (const playerId of [game.player1_id, game.player2_id]) {
                        const playerSocket = activeUsers.get(playerId);
                        playerSocket?.send(JSON.stringify({ type: 'game_start' }));
                    }
                }
            }
			else if (type === 'input' && key) {
                const delta = (key === 'ArrowUp') ? -paddleSpeed : (key === 'ArrowDown') ? paddleSpeed : 0;
                updatePaddleDeltaInOngoingGames(gameId, userId, state === 'keydown' ? delta : 0);
			}
			else if (type === 'FORFEIT') {
				markPlayerAsForfeit(userId);

			}
        } catch (err) {
            console.error("Error processing WebSocket message:", err);
            connection.close(1003, 'Invalid message format');
        }
    });


	connection.on('close', async () => {
		activeUsers.delete(userId);
		const readyPlayers = gameReadyPlayers.get(gameId.toString());
		readyPlayers?.delete(userId);
		if (readyPlayers?.size === 0)
		{
			const updatedGame = endGameInOngoingGames(gameId);
			if (!updatedGame) 
			{
				console.error('game not found');
				return 
			}	
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
			gameReadyPlayers.delete(gameId.toString());
			ongoingGames.delete(gameId.toString());
		}
		console.log(`User ${userId} disconnected`);
		connection.close(1003, 'Invalid message format');

	});

	connection.on('error', (err: Error) => {
		console.error('WebSocket error:', err.message);
		connection.close(1003, 'Invalid message format');
	  });
}


export function endOngoingGamesForfeit(req: FastifyRequest<{ Params: { gameId: string}, Body: {winnerId: string } }>, reply: FastifyReply) {
	const game = ongoingGames.get(req.params.gameId.toString());
	if (!game) {
		console.log('NO GAME FOUND IN endGameInOngoingGames');
		return;
	}
	game.status = 'finished'
	game.winner_id = req.body.winnerId;
	endGameInOngoingGames(game.gameId);
}

async function broadcastGameToPlayers(gameId: string) {
	const game = ongoingGames.get(gameId);
	if (!game) return;
	[game.player1_id, game.player2_id].forEach(userId => {
		const gameSet = gameReadyPlayers.get(gameId.toString());
		if (gameSet?.has(userId)) {
			const socket = activeUsers.get(userId);
			if (socket) {
				const message = {
                    type: 'game_update',
                    game_state: game,
                };
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
		if (!token)
			throw new Error("No token provided");

		const decoded = fastify.jwt.verify(token) as JwtPayload;
		return decoded;
	} catch (err) {
		console.error("Token verification failed:", err);
		return null;
	}
}