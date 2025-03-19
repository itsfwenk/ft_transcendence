import Database from 'better-sqlite3';

if (!process.env.CANVAS_WIDTH
		|| !process.env.CANVAS_HEIGHT
		|| !process.env.PADDLE_WIDTH
		|| !process.env.PADDLE_HEIGHT
		|| !process.env.BALL_RADIUS) {
	console.log("Missing environment variables");
  }

const canvasWidth = parseInt(process.env.CANVAS_WIDTH as string, 10);
const canvasHeight = parseInt(process.env.CANVAS_HEIGHT as string, 10);
const paddleWidth = parseInt(process.env.PADDLE_WIDTH as string, 10);
const paddleHeight = parseInt(process.env.PADDLE_HEIGHT as string, 10);
const ballRadius = parseInt(process.env.BALL_RADIUS as string, 10);
const paddleBasePosition = canvasHeight / 2 - paddleHeight / 2;

export interface Ball {
	x: number;
	y: number;
	radius: number;
	dx: number;
	dy: number
}

export interface Paddle {
	x: number;
	y: number;
	dy: number
}

export interface Game {
	gameId: number;
	player1_id: number;
	player2_id: number;
	score1: number;
	score2: number;
	leftPaddle: Paddle;
	rightPaddle: Paddle;
	ball: Ball;
	status: 'ongoing' | 'finished';
	winner_id?: number | null;
	matchId?: string | null;
}

//const games: Game[] = [];

//connexion a la database game
const db = new Database('/app/db/games.db');
 

//Creation de la table
db.exec(`
	PRAGMA foreign_keys = OFF;  -- ✅ Désactiver les FK pour éviter les erreurs

	CREATE TABLE IF NOT EXISTS games (
	  gameId INTEGER PRIMARY KEY AUTOINCREMENT,
	  player1_id INTEGER NOT NULL,
	  player2_id INTEGER NOT NULL,
	  score1 INTEGER DEFAULT 0,
	  score2 INTEGER DEFAULT 0,
	  leftPaddle TEXT NOT NULL DEFAULT '{"x": 0, "y": ${paddleBasePosition}, "dy": 0}',
	  rightPaddle TEXT NOT NULL DEFAULT '{"x": ${canvasWidth - 10}, "y": ${paddleBasePosition}, "dy": 0}',
	  ball TEXT NOT NULL DEFAULT '{"x": ${canvasWidth / 2}, "y": ${canvasHeight / 2}, "radius": ${ballRadius}, "dx": ${Math.random() > 0.5 ? 3 : -3}, "dy": ${Math.random() > 0.5 ? 3 : -3}}',
	  status TEXT CHECK(status IN ('ongoing', 'finished')) DEFAULT 'ongoing',
	  winner_id INTEGER NULL,
	  matchId TEXT NULL
	);
`);

  

export function saveGame(player1_id: number, player2_id: number, matchId?: string): Game {
	const stmt = db.prepare(`
		INSERT INTO games (player1_id, player2_id, matchId)
		VALUES (?, ?, ?)
	`);
	const result = stmt.run(player1_id, player2_id, matchId || null);
	// return { gameId: result.lastInsertRowid, player1_id, player2_id, score1: 0, score2: 0, status: 'ongoing' } as Game;
	const stmt2 = db.prepare(`SELECT * FROM games WHERE gameId = ?`);
	return stmt2.get(result.lastInsertRowid) as Game;
}

// export async function getGamebyId(gameId: number): Promise<Game> {
// 	//return games.find(g => g.gameId === gameId);
// 	const stmt = db.prepare(`SELECT * FROM games WHERE gameId = ?`);
// 	return stmt.get(gameId) as Game;
// }

export async function getGamebyId(gameId: number): Promise<Game | null> {
	try {
		const stmt = db.prepare(`SELECT * FROM games WHERE gameId = ?`);
		const row: any = stmt.get(gameId);

		if (!row) return null;

		const game: Game = {
			gameId: row.gameId,
			player1_id: row.player1_id,
			player2_id: row.player2_id,
			score1: row.score1,
			score2: row.score2,
			leftPaddle: JSON.parse(row.leftPaddle),
			rightPaddle: JSON.parse(row.rightPaddle),
			ball: JSON.parse(row.ball),
			status: row.status as 'ongoing' | 'finished',
			winner_id: row.winner_id,
			matchId: row.matchId
		};

		return game;
	} catch (error) {
		console.error(`Error fetching game ${gameId}:`, error);
		return null;
	}
}



export function updateGameScore(gameId: number, score1: number, score2: number) {
	const stmt = db.prepare (`
		UPDATE games
		SET score1 = ?, score2 = ?
		WHERE gameId = ?
	`);
	const result = stmt.run(score1, score2, gameId);
	if (result.changes > 0) {
		const updatedStmt = db.prepare(`SELECT * FROM games WHERE gameId = ?`);
		return updatedStmt.get(gameId);
	}
	return null;
}

export function endGameInDb(gameId: number): Game | null {
	const game = db.prepare(`SELECT * FROM games WHERE gameId = ?`).get(gameId) as Game | undefined;
	if (!game) return null;

	let winner_id: number | null = null;
	if (game.score1 > game.score2) winner_id = game.player1_id;
	else if (game.score2 > game.score1) winner_id = game.player2_id;

	const stmt = db.prepare (`
		UPDATE games
		SET status = 'finished', winner_id = ?
		WHERE gameId = ?
	`);
	stmt.run(winner_id, gameId);
	return db.prepare(`SELECT * FROM games WHERE gameId = ?`).get(gameId) as Game | null;
}


export async function updateBallPositionInDb(gameId: number, ball: Ball) {
	try {
		const updatedBallJSON = JSON.stringify(ball);
		const stmt = db.prepare(`
			UPDATE games
			SET ball = ?
			WHERE gameId = ?
		`);
		stmt.run(updatedBallJSON, gameId);
	} catch (err) {
	  console.error('Error updating game in the database:', err);
	}
}

export async function getAllGamesId() : Promise<{ gameId: number }[]> {
	try {
		const stmt = db.prepare('SELECT gameId FROM games');
		const allIds : { gameId: number }[] = stmt.all() as { gameId: number }[];
		return allIds;
	  } catch (error) {
		console.error('Error fetching game Ids:', error);
		return [];
	  }
}

export async function updatePaddleInDb(gameId: number, paddle: Paddle, side: string) {
	try {
		const updatedPaddleJSON = JSON.stringify(paddle);
		let stmt;
		if (side === `left`) {
			stmt = db.prepare(`
				UPDATE games
				SET leftPaddle = ?
				WHERE gameId = ?
			`);
		}
		else {
			stmt = db.prepare(`
				UPDATE games
				SET rightPaddle = ?
				WHERE gameId = ?
			`);
		};
		stmt.run(updatedPaddleJSON, gameId);
	} catch (err) {
	  console.error('Error updating paddle in the database:', err);
	}
}