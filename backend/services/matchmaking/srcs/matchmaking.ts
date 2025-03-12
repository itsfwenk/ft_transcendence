import { v4 as uuidv4 } from 'uuid';
import { createGameSession } from './matchmakingController';

interface Match {
	id: string;
	round: number;
	player1_Id: number;
	player2_Id: number;
	player1Score: number;
	player2Score: number;
	winner_Id?: number;
	status: 'scheduled' | 'in_progress' | 'completed';
	game_id?: string;
}
  
interface Tournament {
	id: string;
	status: 'scheduled' | 'ongoing' | 'completed';
	players: number[]; // Liste des IDs des joueurs
	matches: Match[];
	createdAt: Date;
	updatedAt: Date;
}

let currentTournament: Tournament | null = null;
  
export function createTournament(players: number[]): Tournament {

	if (players.length !== 4) {
		throw new Error("Pas assez de joueurs.");
	}
	const match1: Match = {
		id: uuidv4(),
		round: 1,
		player1_Id: players[0],
		player2_Id: players[1],
		player1Score: 0,
		player2Score: 0,
		status: 'scheduled'
	};
	const match2: Match = {
		id: uuidv4(),
		round: 1,
		player1_Id: players[2],
		player2_Id: players[3],
		player1Score: 0,
		player2Score: 0,
		status: 'scheduled'
	};
	currentTournament = {
		id: uuidv4(),
		status: 'scheduled',
		players: players, // Liste des IDs des joueurs
		matches: [match1, match2],
		createdAt: new Date(),
		updatedAt: new Date()
	};
	return currentTournament;
}
  

export function updateTournamentMatch(tournamentId: string, matchId: string, score1:number, score2:number, winner_id:number) {
	currentTournament = getTournamentByID(tournamentId);
	if (!currentTournament) {
		throw new Error("Aucun tournoi en cours.");
	}
	const match = currentTournament.matches.find(m => m.id === matchId);
	if (!match) {
		throw new Error("Match not found");
	}
	match.player1Score = score1;
	match.player2Score = score2;
	match.winner_Id = winner_id;
	match.status = 'completed';
	return match;
}

  
export function scheduleFinal(): Tournament | null {
	if (!currentTournament) {
		throw new Error("Aucun tournoi en cours.");
	}

	const semiMatches = currentTournament.matches.filter(m => m.round === 1);
	if (semiMatches.length !== 2 || semiMatches.some(m => !m.winner_Id)) {
		throw new Error("Les matchs des demi-finales ne sont pas terminés.");
	}
	const winner1_Id = semiMatches[0].winner_Id;
    const winner2_Id = semiMatches[1].winner_Id;

    if (winner1_Id === undefined || winner2_Id === undefined) {
        throw new Error("Les gagnants des demi-finales ne sont pas définis.");
    }

	const finalMatch: Match = {
		id: uuidv4(),
		round: 2,
		player1_Id: winner1_Id,
		player2_Id: winner2_Id,
		player1Score: 0,
		player2Score: 0,
		winner_Id: 0,
		status: 'completed',
	};
	currentTournament.matches.push(finalMatch);
	currentTournament.status = 'ongoing';
	currentTournament.updatedAt = new Date();
	return currentTournament;
}



