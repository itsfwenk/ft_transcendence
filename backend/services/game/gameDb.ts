import Database from 'better-sqlite3';






interface Game {
	gameId: number;
	player1_id: number;
	player2_id: number;
	score1: number;
	score2: number;
	status: 'ongoing' | 'finished';
	winner_id?: number | null;
}

//const games: Game[] = [];

//connexion a la database game
const db = new Database('./backend/db/games.db');
const userDb = new Database('./backend/db/users.db'); // ✅ Vérifier qu'on ouvre bien `users.db`

console.log("📂 Base de données chargée:", {
	gamesDB: db.name,
	usersDB: userDb.name
  });


//Creation de la table
db.exec(`
	PRAGMA foreign_keys = ON;
  
	CREATE TABLE IF NOT EXISTS games (
	  gameId INTEGER PRIMARY KEY AUTOINCREMENT,
	  player1_id INTEGER NOT NULL,
	  player2_id INTEGER NOT NULL,
	  score1 INTEGER DEFAULT 0,
	  score2 INTEGER DEFAULT 0,
	  status TEXT CHECK(status IN ('ongoing', 'finished')) DEFAULT 'ongoing',
	  winner_id INTEGER NULL,
	  FOREIGN KEY (player1_id) REFERENCES users(userId) ON DELETE CASCADE,
	  FOREIGN KEY (player2_id) REFERENCES users(userId) ON DELETE CASCADE,
	  FOREIGN KEY (winner_id) REFERENCES users(userId) ON DELETE SET NULL
	);
 `);
  

export function saveGame(player1_id: number, player2_id: number): Game {
	const stmt = db.prepare(`
		INSERT INTO games (player1_id, player2_id)
		VALUES (?, ?)
	`);
	const result = stmt.run(player1_id, player2_id);
	return { gameId: result.lastInsertRowid, player1_id, player2_id, score1: 0, score2: 0, status: 'ongoing' } as Game;
}

export function getGamebyId(gameId: number): Game {
	//return games.find(g => g.gameId === gameId);
	const stmt = db.prepare(`SELECT * FROM games WHERE gameId = ?`);
	return stmt.get(gameId) as Game;
}

export function updateGameScore(gameId: number, score1: number, score2: number) {
	const stmt = db.prepare (`
		UPDATE games
		SET score1 = ?, score2 = ?
		WHERE gameId = ?
	`);
	const result = stmt.run(score1, score2, gameId);
	console.log("resultat de l'update", result)
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
		SET status = 'finished', winner = ?
		WHERE gameId = ?
	`);
	stmt.run(winner_id, gameId);
	return db.prepare(`SELECT * FROM games WHERE gameId = ?`).get(gameId) as Game | null;
}