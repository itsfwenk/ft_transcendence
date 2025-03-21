import { FastifyRequest, FastifyReply } from 'fastify';
import { endGameInDb, getGamebyId, saveGame, updateGameScore, updateBallPositionInDb, getAllGamesId, updatePaddleDelta, updatePaddlesInDb } from './gameDb.js'
import { Ball, Paddle, Game } from './gameDb.js'
import axios from 'axios';
import { WebSocket } from "ws";
import jwt from 'jsonwebtoken';

const canvasWidth = parseInt(process.env.CANVAS_WIDTH as string, 10);
const canvasHeight = parseInt(process.env.CANVAS_HEIGHT as string, 10);
const paddleWidth = parseInt(process.env.PADDLE_WIDTH as string, 10);
const paddleHeight = parseInt(process.env.PADDLE_HEIGHT as string, 10);
const paddleSpeed = parseInt(process.env.PADDLE_SPEED as string, 10);
const ballRadius = parseInt(process.env.BALL_RADIUS as string, 10);
const speedIncrease = parseInt(process.env.SPEED_INCREASE as string, 10);

const activeUsers = new Map<string, WebSocket>(); // userId -> WebSocket
export default activeUsers;

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
export async function startGame(req: FastifyRequest<{ Body: { player1_id: number; player2_id: number; matchId?: string } }>, reply: FastifyReply) {
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

async function getUserById(userId: number) {
	try {
		console.log(userId);
		const baseUrl = process.env.USER_SERVICE_BASE_URL || 'http://user:4001';
		const response = await axios.get(`${baseUrl}/user/${userId}`);
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

export async function updateBallPosition(gameId: string) {
	try {
		// console.log(`updateBallPosition called`);
		const game = await getGamebyId(gameId);
		if (!game) {
			console.error(`Game ${gameId} not found`);
			return;
		}
		if (game.status === `finished`)
			return
		const ball: Ball = game.ball;
		ball.x += ball.dx;
		ball.y += ball.dy;
		// Check top-bottom collisions
		if (ball.y - ball.radius <= 0) {
			ball.dy *= -1;
			ball.y += 3;
		}
		else if (ball.y  + ball.radius >= canvasHeight) {
			ball.dy *= -1;
			ball.y -= 3;
		}

		// Check collision with paddles

		let leftPaddle : Paddle | null | undefined = await getPaddle(gameId, `left`);
		if (leftPaddle === null || leftPaddle === undefined)
			console.error(`Error with left paddle`)

		else if (
			ball.x - ball.radius <= leftPaddle.x + paddleWidth &&
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

		let rightPaddle : Paddle | null | undefined = await getPaddle(gameId, `right`);
		if (rightPaddle === null || rightPaddle === undefined)
			console.error(`Error with right paddle`)

		else if (
			ball.x + ball.radius >= rightPaddle.x &&
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
			game.score2++;
			resetBall();
		  } 
		else if (ball.x > canvasWidth) {
			await updateGameScore(gameId, game.score1 + 1, game.score2);
			game.score1++;
			resetBall();
		  }
		function resetBall() {
			ball.x = canvasWidth / 2;
			ball.y = canvasHeight / 2;
			ball.dx = Math.random() > 0.5 ? 3 : -3;
			ball.dy = Math.random() > 0.5 ? 3 : -3;
		  }
		
		await updateBallPositionInDb(gameId, ball);
	}
	catch (error) {
		console.error("Error updating ball:", error);
	}
}

async function getPaddle(gameId: string, side: string) {
	try {
		const game = await getGamebyId(gameId);
		if (!game) {
			console.error(`Game ${gameId} not found`);
			return;
		}
		if (side === `left`)
			return (game.leftPaddle);
		else (side === `right`)
			return (game.rightPaddle);
	} catch (error) {
		console.error(`❌ Error while retrieving paddle`);
		}
	  return null;
}

export async function updateGames() {
	try {
		const allIds : {gameId: string }[] = await getAllGamesId();
	
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

const JWT_SECRET = "secret_key";

export async function websocketHandshake(connection: WebSocket, req: FastifyRequest) {
	console.log('websocketHandshake called');

	const { token, gameId, playerId } = req.query as { token: string, gameId: string, playerId: string };
	
	activeUsers.set(playerId, connection);
	console.log(`User ${playerId} connected via WebSocket`);
	
	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		console.log('Authenticated Player:', decoded);
	
		connection.on('message', (message) => {
			const { key, type } = JSON.parse(message.toString());
			if (!key || !type) {
				console.warn("Invalid message received:", message.toString());
				return;
			}
			if (key === 'ArrowUp') {
				if (type === "keydown") {
					updatePaddleDelta(gameId, playerId, -paddleSpeed);
				}
				else if (type === "keyup") {
					updatePaddleDelta(gameId, playerId, 0);
				}
			} else if (key === 'ArrowDown') {
				if (type === "keydown") {
					updatePaddleDelta(gameId, playerId, paddleSpeed);
				}
				else if (type === "keyup") {
					updatePaddleDelta(gameId, playerId, 0);
				}
			}
		})
	  } catch (err) {
		console.error("Server side Websocket error", err);
		connection.close(1000, 'Invalid Token');




	// Handle socket close
	connection.on('close', () => {
		activeUsers.delete(playerId);
		console.log(`User ${playerId} disconnected`);
	});

	connection.on('error', (err: Error) => {
		console.error('WebSocket error:', err.message);
	  });
}
}

async function broadcastGameToPlayers(gameId: string) {
	const game = await getGamebyId(gameId);
	if (!game) return;

	[game.player1_id, game.player2_id].forEach(userId => {
		const socket = activeUsers.get(userId);
		if (socket) {
		socket.send(JSON.stringify(game));
		}
	});
}
  
// export async function movePaddleUp(gameId: number, paddle: number) {
// 	const game = await getGamebyId(gameId);
// 	if (!game) {
// 		console.log(`Game not found in movePaddleUp`);
// 		return
// 		}
// 	if (paddle === 1) {
// 		movePaddleUpInDb();
// 		}
// 	}
// }

//////////
// import { FastifyInstance, FastifyPluginOptions } from "fastify";
// import jwt from "jsonwebtoken";

// export default async function gameRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
//     fastify.get("/game/ws", { websocket: true }, (connection, req) => {
//         const token = req.query.token as string;  // Extract token from the query string

//         // Verify the token
//         try {
//             const decoded = jwt.verify(token, "your_secret_key");  // Verify the JWT using the secret key
//             const playerId = decoded.username;  // Assume playerId is in the 'username' field

//             console.log(`Player ${playerId} connected`);

//             // Store the connection and associate it with the player
//             playerConnections.set(playerId, connection.socket);

//             // Handle player messages
//             connection.socket.on("message", (message) => {
//                 console.log(`Received from ${playerId}: ${message.toString()}`);
//             });

//             connection.socket.on("close", () => {
//                 // Cleanup when the player disconnects
//                 playerConnections.delete(playerId);
//                 console.log(`Player ${playerId} disconnected`);
//             });

//             connection.socket.send("Welcome to the game!");

//         } catch (err) {
//             console.log("Invalid token, closing connection.");
//             connection.socket.close();  // Close connection if the token is invalid
//         }
//     });
// }

// // Store player connections in a map
// const playerConnections = new Map<string, WebSocket>();  // playerId -> WebSocket connection
