import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

const db = new Database('/app/db/matchmaking.db');

export interface Match {
	id: string;
	round: number;
	player1_Id: string;
	player2_Id: string;
	player1Score: number;
	player2Score: number;
	winner_Id?: string;
	status: 'pending' | 'in_progress' | 'completed';
	matchTime: Date;
}
  
export interface Tournament {
	id: string;
	status: 'scheduled' | 'in_progress' | 'completed';
	state: 'tournament_launch' | 'final_prep' | 'final_end' | 'end_screen';
	players: string[];
	matches: Match[];
	createdAt: Date;
	updatedAt: Date;
}

db.exec(`
	CREATE TABLE IF NOT EXISTS Tournament (
		id TEXT PRIMARY KEY,
		status TEXT,
		players TEXT, -- Stocker une liste JSON d'IDs de joueurs
		createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
	);
`);

db.exec(`
	CREATE TABLE IF NOT EXISTS TournamentMatch (
		id TEXT PRIMARY KEY,
		tournamentId TEXT, -- Clé étrangère vers Tournament.id
		round INTEGER,
		player1_Id STRING,
		player2_Id STRING,
		player1Score INTEGER,
		player2Score INTEGER,
		winnerId STRING NULL,
		status TEXT,  -- pending, in_progress, completed,
		matchTime DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (tournamentId) REFERENCES Tournament(id)
	);
`);

export function createTournament(players: string[]): Tournament {

	if (players.length !== 4) {
		throw new Error("Pas assez de joueurs.");
	}
	const tournamentId = uuidv4();

	const insertTournamentStmt = db.prepare(`
		INSERT INTO Tournament (id, status, players, createdAt, updatedAt)
		VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	  `);

	insertTournamentStmt.run(tournamentId, 'scheduled', JSON.stringify(players));

	const match1: Match = {
		id: uuidv4(),
		round: 1,
		player1_Id: players[0],
		player2_Id: players[1],
		player1Score: 0,
		player2Score: 0,
		status: 'pending',
		matchTime: new Date()
	};
	const match2: Match = {
		id: uuidv4(),
		round: 1,
		player1_Id: players[2],
		player2_Id: players[3],
		player1Score: 0,
		player2Score: 0,
		status: 'pending',
		matchTime: new Date()
	};

	const insertMatchStmt = db.prepare(`
		INSERT INTO TournamentMatch(id, tournamentId, round, player1_Id, player2_Id, player1Score, player2Score, winnerId, status, matchTime)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
	`);
	
	insertMatchStmt.run(match1.id, tournamentId, match1.round, match1.player1_Id, match1.player2_Id, 0, 0, null, 'scheduled');
	insertMatchStmt.run(match2.id, tournamentId, match2.round, match2.player1_Id, match2.player2_Id, 0, 0, null, 'scheduled');
	
	const tournament: Tournament = {
		id: tournamentId,
		status: 'scheduled',
		state: 'tournament_launch',
		players,
		matches: [match1, match2],
		createdAt: new Date(),
		updatedAt: new Date(),
	}
	return tournament;
}

interface TournamentRow {
    id: string;
    status: 'scheduled' | 'in_progress' | 'completed';
	state: 'tournament_launch' | 'final_prep' | 'final_end' | 'end_screen'; 
    players: string; 
    createdAt: string;
    updatedAt: string;
}

interface MatchRow {
    id: string;
    round: number;
    player1_Id: string;
    player2_Id: string;
    player1Score: number;
    player2Score: number;
    winnerId: string;
    status: 'pending' | 'in_progress' | 'completed';
	matchTime: string;
}

export function getTournamentById(tournamentId: string): Tournament | null {
    const row = db.prepare('SELECT * FROM Tournament WHERE id = ?').get(tournamentId) as TournamentRow | undefined;
    if (!row) return null;
    const matches = db.prepare('SELECT * FROM TournamentMatch WHERE tournamentId = ?').all(tournamentId) as MatchRow[];
    return {
        id: row.id,
        status: row.status,
		state: row.state,
        players: JSON.parse(row.players),
        matches: matches.map((m: MatchRow) => ({
            id: m.id,
            round: m.round,
            player1_Id: m.player1_Id,
            player2_Id: m.player2_Id,
            player1Score: m.player1Score,
            player2Score: m.player2Score,
            winner_Id: m.winnerId,
            status: m.status,
			matchTime: new Date(m.matchTime)
        })),
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
    };
}

export function updateMatch(matchId: string, score1: number, score2: number, winnerId: string): any {
	const stmt = db.prepare(`
		UPDATE TournamentMatch
		SET player1Score = ?, player2Score = ?, winnerId = ?, status = 'completed', matchTime = CURRENT_TIMESTAMP
		WHERE id = ?
		RETURNING *
	  `);
	const updatedMatch = stmt.get(
		score1, 
		score2, 
		winnerId, 
		matchId
	);
  	return updatedMatch;
}

export function updateMatchv2(match: Match): any {
	const stmt = db.prepare(`
		UPDATE TournamentMatch
		SET player1Score = ?, player2Score = ?, winnerId = ?, status = ?, matchTime = CURRENT_TIMESTAMP
		WHERE id = ?
		RETURNING *
	  `);
	const updatedMatch = stmt.get(
		match.player1Score, 
		match.player2Score, 
		match.winner_Id || null, 
		match.status,
		match.id,
	);
  	return updatedMatch;
}

export function scheduleFinal(tournamentId: string): void {
	const tournament = getTournamentById(tournamentId);
	if (!tournament) {
		throw new Error("Aucun tournoi en cours.");
	}
	const semiMatches = tournament.matches.filter(m => m.round === 1);
	if (semiMatches.length !== 2 || semiMatches.some(m => !m.winner_Id)) {
		throw new Error("Les matchs des demi-finales ne sont pas terminés.");
	}
	const finalMatch = tournament.matches.find(m => m.round === 2);
	if (finalMatch) {
		throw new Error("La finale est déjà prévue.");
	}
	const winner1_Id = semiMatches[0].winner_Id;
    const winner2_Id = semiMatches[1].winner_Id;

    if (winner1_Id === undefined || winner2_Id === undefined) {
        throw new Error("Les gagnants des demi-finales ne sont pas définis.");
    }

	const finalMatchId = uuidv4();
  
	const insertMatchStmt = db.prepare(`
		INSERT INTO TournamentMatch (id, tournamentId, round, player1_Id, player2_Id, player1Score, player2Score, status, matchTime)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
	`);
	insertMatchStmt.run(finalMatchId, tournamentId, 2, winner1_Id, winner2_Id, 0, 0, 'scheduled');
	
	const updateTournamentStmt = db.prepare(`
		UPDATE Tournament
		SET status = 'ongoing', updatedAt = CURRENT_TIMESTAMP
		WHERE id = ?
	`);
	updateTournamentStmt.run(tournamentId);
}

export function getMatchbyId(matchId: string): Match {
	const stmt = db.prepare(`SELECT * FROM TournamentMatch WHERE id = ?`);
	console.log(matchId);
	const result = stmt.get(matchId);
	if (!result) {
		console.error(`Aucun match trouve pour l'ID ${matchId}`);
		throw new Error("Aucun match avec cet id.");
	}
	return result as Match;
}

export function finishTournament(tournamentId: string):void {
	const tournament = getTournamentById(tournamentId);
	if (!tournament) {
		throw Error ("Aucun tournoi avec ce Tournament Id");
	}
	const finalMatch = tournament.matches.find(m => m.round === 2);
	if (!finalMatch) {
		throw new Error("La finale n'est pas encore prete.");
	} 
	if (finalMatch.status !== 'completed') {
		throw new Error("La finale n'est pas encore terminee.");
	}
	const updateTournamentStmt = db.prepare(`
		UPDATE Tournament
		SET status = 'completed', updatedAt = CURRENT_TIMESTAMP
		WHERE id = ?
	`);
	updateTournamentStmt.run(tournamentId);
}