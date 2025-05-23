import Database from 'better-sqlite3';
import { Game, Ball, Paddle } from '../gameInterfaces'
import { instrumentedRun } from '../metrics/sqlite';



if (!process.env.CANVAS_WIDTH
		|| !process.env.CANVAS_HEIGHT
		|| !process.env.PADDLE_WIDTH
		|| !process.env.PADDLE_HEIGHT
		|| !process.env.BALL_RADIUS) {
	console.log("Missing environment variables");
  }

const canvasWidth = parseInt(process.env.CANVAS_WIDTH as string, 10);
const canvasHeight = parseInt(process.env.CANVAS_HEIGHT as string, 10);
// const paddleWidth = parseInt(process.env.PADDLE_WIDTH as string, 10);
const paddleHeight = parseInt(process.env.PADDLE_HEIGHT as string, 10);
const ballRadius = parseInt(process.env.BALL_RADIUS as string, 10);
const paddleBasePosition = canvasHeight / 2 - paddleHeight / 2;

// export interface Ball {
// 	x: number;
// 	y: number;
// 	radius: number;
// 	dx: number;
// 	dy: number
// }

// export interface Paddle {
// 	x: number;
// 	y: number;
// 	dy: number
// }

// export interface Game {
// 	gameId: string;
// 	player1_id: string;
// 	player2_id: string;
// 	score1: number;
// 	score2: number;
// 	leftPaddle: Paddle;
// 	rightPaddle: Paddle;
// 	ball: Ball;
// 	status: 'waiting' | 'ongoing' | 'finished';
// 	winner_id?: string | null;
// 	matchId?: string | null;
// 	canvasWidth: number;
// 	canvasHeight: number;
// }

//const games: Game[] = [];

//connexion a la database game
const db = new Database('/app/db/games.db');
 

//Creation de la table
db.exec(`
	PRAGMA foreign_keys = OFF;  -- ✅ Désactiver les FK pour éviter les erreurs

	CREATE TABLE IF NOT EXISTS games (
	  gameId INTEGER DEFAULT 0,
	  player1_id STRING NOT NULL,
	  player2_id STRING NOT NULL,
	  score1 INTEGER DEFAULT 0,
	  score2 INTEGER DEFAULT 0,
	  leftPaddle TEXT NOT NULL DEFAULT '{"x": 0, "y": ${paddleBasePosition}, "dy": 0}',
	  rightPaddle TEXT NOT NULL DEFAULT '{"x": ${canvasWidth - 10}, "y": ${paddleBasePosition}, "dy": 0}',
	  ball TEXT NOT NULL DEFAULT '{"x": ${canvasWidth / 2}, "y": ${canvasHeight / 2}, "radius": ${ballRadius}, "dx": ${Math.random() > 0.5 ? 3 : -3}, "dy": ${Math.random() > 0.5 ? 3 : -3}}',
	  status TEXT CHECK(status IN ('waiting', 'ongoing', 'finished')) DEFAULT 'waiting',
	  winner_id STRING NULL,
	  matchId TEXT NULL,
	  canvasWidth INTEGER DEFAULT ${canvasWidth},
	  canvasHeight INTEGER DEFAULT ${canvasHeight}
	);
`);

  

export function saveGame(player1_id: string, player2_id: string, matchId?: string): Game {
  return instrumentedRun('game', 'INSERT game', () => {
    const stmt = db.prepare(`
      INSERT INTO games (player1_id, player2_id, matchId)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(player1_id, player2_id, matchId || null);
    const stmt2 = db.prepare(`SELECT * FROM games WHERE gameId = ?`);
    return stmt2.get(result.lastInsertRowid) as Game;
  });
}

export function getGamebyId(gameId: string): Game | null {
  return instrumentedRun('game', 'SELECT game by id', () => {
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
        status: row.status as 'waiting' | 'ongoing' | 'finished',
        winner_id: row.winner_id,
        matchId: row.matchId,
        canvasWidth: row.canvasWidth, 
        canvasHeight: row.canvasHeight
      };

      return game;
    } catch (error) {
      console.error(`Error fetching game ${gameId}:`, error);
      return null;
    }
  });
}

export function getAllGamesId(): { gameId: string }[] {
  return instrumentedRun('game', 'SELECT all gameIds', () => {
    try {
      const stmt = db.prepare('SELECT gameId FROM games');
      return stmt.all() as { gameId: string }[];
    } catch (error) {
      console.error('Error fetching game Ids:', error);
      return [];
    }
  });
}

export function updateGameScore(gameId: string, score1: number, score2: number) {
  return instrumentedRun('game', 'UPDATE score', () => {
    const stmt = db.prepare (`
      UPDATE games
      SET score1 = ?, score2 = ?, status = ?
      WHERE gameId = ?
    `);
    let result;
    if (score1 < 5 && score2 < 5) {
      result = stmt.run(score1, score2, 'ongoing', gameId);
    } else {
      console.log("game finished in updateGameScore")
      result = stmt.run(score1, score2, 'finished', gameId);
    }
    if (result.changes > 0) {
      const updatedStmt = db.prepare(`SELECT * FROM games WHERE gameId = ?`);
      return updatedStmt.get(gameId);
    }
    return null;
  });
}

export function endGameInDb(gameId: string): Game | null {
  return instrumentedRun('game', 'UPDATE game (end)', () => {
    const game = db.prepare(`SELECT * FROM games WHERE gameId = ?`).get(gameId) as Game | undefined;
    if (!game) return null;
    console.log("endGameInDB game", game);
    if (game.status === 'finished' && game.winner_id != null) return game;

    let winner_id: string | null = null;
    if (game.score1 > game.score2) winner_id = game.player1_id;
    else if (game.score2 > game.score1) winner_id = game.player2_id;

    const stmt = db.prepare (`
      UPDATE games
      SET status = 'finished', winner_id = ?
      WHERE gameId = ?
    `);
    stmt.run(winner_id, gameId);
    return db.prepare(`SELECT * FROM games WHERE gameId = ?`).get(gameId) as Game | null;
  });
}

export function endGameForfeitInDb(game: Game): Game | null {
  return instrumentedRun('game', 'UPDATE game (forfeit)', () => {
    const stmt = db.prepare (`
      UPDATE games
      SET status = 'finished', winner_id = ?
      WHERE gameId = ?
    `);
    stmt.run(game.winner_id, game.gameId);
    return db.prepare(`SELECT * FROM games WHERE gameId = ?`).get(game.gameId) as Game | null;
  });
}

export function updateBallPositionInDb(gameId: string, ball: Ball) {
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

export function updateGameStatusInDb(gameId: string, status: string) {
  return instrumentedRun('game', 'UPDATE status', () => {
    try {
      const stmt = db.prepare (`
        UPDATE games
        SET status = ?
        WHERE gameId = ?
      `)
      stmt.run(status, gameId);
    } catch (err) {
      console.error('Error updating game status in the database:', err);
    }
  });
}


export function updatePaddlesInDb(gameId: string) {
    try {
      const game = getGamebyId(gameId);
      const leftPaddle = game?.leftPaddle;
      const rightPaddle = game?.rightPaddle;
      if (leftPaddle && rightPaddle) {
        leftPaddle.y = leftPaddle.y + leftPaddle.dy;
        rightPaddle.y = rightPaddle.y + rightPaddle.dy;

        leftPaddle.y = Math.max(0, Math.min(game.canvasHeight - paddleHeight, leftPaddle.y));
        rightPaddle.y = Math.max(0, Math.min(game.canvasHeight - paddleHeight, rightPaddle.y));

        rightPaddle.x = game.canvasWidth - 10;
      }
      const stmt = db.prepare (`
        UPDATE games
        SET leftPaddle = ?, rightPaddle = ?
        WHERE gameId = ?
      `)
      const leftPaddleJSON = JSON.stringify(leftPaddle);
      const rightPaddleJSON = JSON.stringify(rightPaddle);
      stmt.run(leftPaddleJSON, rightPaddleJSON, gameId);
    } catch (err) {
      console.error('Error updating paddles in the database:', err);
    }
}

export function updatePaddleDelta(gameId: string, playerId: string, delta: number) {
    try {
      const game = getGamebyId(gameId);
      let paddle;
      if (game) {
        if (playerId === game.player1_id) {
          paddle = game.leftPaddle;
          paddle.dy = delta;
          updateEntirePaddleInDb(gameId, paddle, `left`);
        } else {
          paddle = game.rightPaddle;
          paddle.dy = delta;
          updateEntirePaddleInDb(gameId, paddle, `right`);
        }
      }
    } catch (err) {
      console.error('Error updating paddle delta in the database:', err);
    }
}

function updateEntirePaddleInDb(gameId: string, paddle: Paddle, side: string) {
    try {
      const updatedPaddleJSON = JSON.stringify(paddle);
      let stmt;
      if (side === `left`) {
        stmt = db.prepare(`
          UPDATE games
          SET leftPaddle = ?
          WHERE gameId = ?
        `);
      } else {
        stmt = db.prepare(`
          UPDATE games
          SET rightPaddle = ?
          WHERE gameId = ?
        `);
      }
      stmt.run(updatedPaddleJSON, gameId);
    } catch (err) {
      console.error('Error updating paddle in the database:', err);
    }
}

export async function saveGameInDb(game: Game) {
	try {
		const stmt = db.prepare(`
			INSERT INTO games (
				gameId,
				player1_id,
				player2_id,
				score1,
				score2,
				leftPaddle,
				rightPaddle,
				ball,
				status,
				winner_id,
				matchId,
				canvasWidth,
				canvasHeight
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`);

		stmt.run(
			game.gameId,		
			game.player1_id,
			game.player2_id,
			game.score1,
			game.score2,
			JSON.stringify(game.leftPaddle),
			JSON.stringify(game.rightPaddle),
			JSON.stringify(game.ball),
			game.status,
			game.winner_id,
			game.matchId,
			game.canvasWidth,
			game.canvasHeight
		);
	} catch(error) {
		console.error('Error while saving game db :', error);
	}
}

export async function updateGameInDb(game: Game) {
	try {
		const stmt = db.prepare(`
			UPDATE games
			SET
				player1_id = ?,
				player2_id = ?,
				score1 = ?,
				score2 = ?,
				leftPaddle = ?,
				rightPaddle = ?,
				ball = ?,
				status = ?,
				winner_id = ?,
				matchId = ?,
				canvasWidth = ?,
				canvasHeight = ?
			WHERE
				gameId = ?;
		`);

		stmt.run(
			game.player1_id,
			game.player2_id,
			game.score1,
			game.score2,
			JSON.stringify(game.leftPaddle),
			JSON.stringify(game.rightPaddle),
			JSON.stringify(game.ball),
			game.status,
			game.winner_id,
			game.matchId,
			game.canvasWidth,
			game.canvasHeight,
			game.gameId,
		);
	} catch(error) {
		console.error('Error while updating game db :', error);
	}
}