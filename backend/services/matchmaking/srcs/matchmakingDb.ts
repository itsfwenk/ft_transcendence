import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import {instrumentedRun } from '../metrics/sqlite';

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
	tournament_Id?: string;
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
	CREATE TABLE IF NOT EXISTS Match (
		id TEXT PRIMARY KEY,
		tournament_Id TEXT, -- Clé étrangère vers Tournament.id
		round INTEGER,
		player1_Id STRING,
		player2_Id STRING,
		player1Score INTEGER,
		player2Score INTEGER,
		winner_Id STRING NULL,
		status TEXT,  -- pending, in_progress, completed,
		matchTime DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (tournament_Id) REFERENCES Tournament(id)
	);
`);

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
	tournament_Id: string;
    round: number;
    player1_Id: string;
    player2_Id: string;
    player1Score: number;
    player2Score: number;
    winner_Id: string;
    status: 'pending' | 'in_progress' | 'completed';
	matchTime: string;
}

export function createMatch(player1: string, player2: string, round: number, tournament_Id?: string): Match {
  const match: Match = {
    id: uuidv4(),
    tournament_Id,
    round,
    player1_Id: player1,
    player2_Id: player2,
    player1Score: 0,
    player2Score: 0,
    status: 'pending',
    matchTime: new Date()
  };

  instrumentedRun('matchmaking', 'INSERT Match', () => {
    const insertMatchStmt = db.prepare(`
      INSERT INTO Match(id, tournament_Id, round, player1_Id, player2_Id, player1Score, player2Score, winner_Id, status, matchTime)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    insertMatchStmt.run(match.id, match.tournament_Id, match.round, match.player1_Id, match.player2_Id, 0, 0, null, 'pending');
  });

  return match;
}

export function createTournament(players: string[]): Tournament {
  if (players.length !== 4) {
    throw new Error("Pas assez de joueurs.");
  }
  const tournament_Id = uuidv4();

  instrumentedRun('matchmaking', 'INSERT Tournament', () => {
    const insertTournamentStmt = db.prepare(`
      INSERT INTO Tournament (id, status, players, createdAt, updatedAt)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    insertTournamentStmt.run(tournament_Id, 'scheduled', JSON.stringify(players));
  });

  const match1: Match = createMatch(players[0], players[1], 1, tournament_Id);
  const match2: Match = createMatch(players[2], players[3], 1, tournament_Id);

  const tournament: Tournament = {
    id: tournament_Id,
    status: 'scheduled',
    state: 'tournament_launch',
    players,
    matches: [match1, match2],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return tournament;
}

export function updateMatch(matchId: string, score1: number, score2: number, winner_Id: string): any {
  return instrumentedRun('matchmaking', 'UPDATE Match (complete)', () => {
    const stmt = db.prepare(`
      UPDATE Match
      SET player1Score = ?, player2Score = ?, winner_Id = ?, status = 'completed', matchTime = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `);
    return stmt.get(score1, score2, winner_Id, matchId);
  });
}

export function updateMatchv2(match: Match): any {
  return instrumentedRun('matchmaking', 'UPDATE Match v2', () => {
    const stmt = db.prepare(`
      UPDATE Match
      SET player1Score = ?, player2Score = ?, winner_Id = ?, status = ?, matchTime = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `);
    return stmt.get(
      match.player1Score,
      match.player2Score,
      match.winner_Id || null,
      match.status,
      match.id,
    );
  });
}

export function getTournamentById(tournament_Id: string): Tournament | null {
  const row = instrumentedRun('matchmaking', 'SELECT Tournament by id', () =>
    db.prepare('SELECT * FROM Tournament WHERE id = ?').get(tournament_Id) as TournamentRow | undefined
  );
  if (!row) return null;

  const matches = instrumentedRun('matchmaking', 'SELECT Match by tournament_Id', () =>
    db.prepare('SELECT * FROM Match WHERE tournament_Id = ?').all(tournament_Id) as MatchRow[]
  );

  return {
    id: row.id,
    status: row.status,
    state: row.state,
    players: JSON.parse(row.players),
    matches: matches.map((m: MatchRow) => ({
      id: m.id,
      tournament_Id: m.tournament_Id,
      round: m.round,
      player1_Id: m.player1_Id,
      player2_Id: m.player2_Id,
      player1Score: m.player1Score,
      player2Score: m.player2Score,
      winner_Id: m.winner_Id,
      status: m.status,
      matchTime: new Date(m.matchTime)
    })),
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

export function getMatchbyId(matchId: string): Match {
  const result = instrumentedRun('matchmaking', 'SELECT Match by id', () => {
    const stmt = db.prepare(`SELECT * FROM Match WHERE id = ?`);
    return stmt.get(matchId);
  });
  if (!result) {
    console.error(`Aucun match trouve pour l'ID ${matchId}`);
    throw new Error("Aucun match avec cet id.");
  }
  return result as Match;
}

export function getMatchHistoryByUserId(userId: string) {
  const matches = instrumentedRun('matchmaking', 'SELECT Match history by userId', () => {
    const stmt = db.prepare(`
      SELECT m.*, t.status as tournamentStatus
      FROM Match m
      LEFT JOIN Tournament t ON m.tournament_Id = t.id
      WHERE (m.player1_Id = ? OR m.player2_Id = ?) AND m.status = 'completed'
      ORDER BY m.matchTime DESC
    `);
    return stmt.all(userId, userId) as any[];
  });

  return matches.map(match => {
    const isPlayer1 = match.player1_Id === userId;

    return {
      gameId: match.id,
      gameType: match.tournament_Id ? (match.round === 2 ? 'tournament-final' : 'tournament-semifinal') : '1v1',
      opponent: {
        userId: isPlayer1 ? match.player2_Id : match.player1_Id
      },
      result: match.winner_Id === userId ? 'win' : 'loss',
      score: {
        player: isPlayer1 ? match.player1Score : match.player2Score,
        opponent: isPlayer1 ? match.player2Score : match.player1Score
      },
      date: match.matchTime,
      tournament_Id: match.tournament_Id || null
    };
  });
}

export function scheduleFinal(tournament_Id: string): void {
  const tournament = getTournamentById(tournament_Id);
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

  instrumentedRun('matchmaking', 'INSERT Match (final)', () => {
    const insertMatchStmt = db.prepare(`
      INSERT INTO Match (id, tournament_Id, round, player1_Id, player2_Id, player1Score, player2Score, status, matchTime)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    insertMatchStmt.run(finalMatchId, tournament_Id, 2, winner1_Id, winner2_Id, 0, 0, 'pending');
  });

  instrumentedRun('matchmaking', 'UPDATE Tournament (ongoing)', () => {
    const updateTournamentStmt = db.prepare(`
      UPDATE Tournament
      SET status = 'ongoing', updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    updateTournamentStmt.run(tournament_Id);
  });
}

export function finishTournament(tournament_Id: string): void {
  const tournament = getTournamentById(tournament_Id);
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
  instrumentedRun('matchmaking', 'UPDATE Tournament (completed)', () => {
    const updateTournamentStmt = db.prepare(`
      UPDATE Tournament
      SET status = 'completed', updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    updateTournamentStmt.run(tournament_Id);
  });
}
