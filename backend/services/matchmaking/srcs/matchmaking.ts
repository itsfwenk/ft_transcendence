import { v4 as uuidv4 } from 'uuid';
import { createGameSession } from './matchmakingController';
import { getMatchbyId, getTournamentById, Match, Tournament } from './matchmakingDb';

/*tournoi
- inscription des joueurs a un tournoi
- quand 4 joueurs sont isncrit dans la queue, creation du tournoi
- creation des brackets et des match
- lancement des matchs de round1 -> service game
- service game update la fin des match de round 1.
- creation et lancement du match final -> service game
- service game update la fin du match du tournoi
- vainqueur / perdant vois un message sur leur ecran.
*/

export async function launchMatch(matchId: string): Promise<void> {
	const match = getMatchbyId(matchId);
	if (!match) {
		throw new Error("Aucun match avec cet id.");
	}
	console.log(`Lancement du match ${match.id} entre le joueur ${match.player1_Id} et le joueur ${match.player2_Id}`);
	const gameSesssionId = await createGameSession(match.player1_Id, match.player2_Id, match.id);
	match.gameSessionId = gameSesssionId;
	match.status = 'in_progress'; // peut-etre qu'il faudrait update la BDD
	console.log(`match ${match.id} lance avec gameSessionId: ${gameSesssionId}`);
}


  

// export function updateTournamentMatch(tournamentId: string, matchId: string, score1:number, score2:number, winner_id:number) {
// 	const tournament = getTournamentById(tournamentId);
// 	if (!tournament) {
// 		throw new Error("Aucun tournoi en cours.");
// 	}
// 	const match = tournament.matches.find(m => m.id === matchId);
// 	if (!match) {
// 		throw new Error("Match not found");
// 	}
// 	match.player1Score = score1;
// 	match.player2Score = score2;
// 	match.winner_Id = winner_id;
// 	match.status = 'completed';
// 	//return match;

// 	const round = match.round;
// 	const matchesRound = tournament.matches.filter(m => m.round === round);
// 	const allCompleted = matchesRound.every(m => m.status == 'completed')

// 	if (allCompleted) {
// 		console.log(`Tous les matchs du round ${round} sont terminés. Lancement du match final...`);
// 		scheduleFinal(tournament);
// 	}
// }




export async function launchFinalMatch(finalMatch: Match): Promise<void> {
  // Appeler le service Game pour démarrer la partie finale
  const gameSessionId = await createGameSession(finalMatch.player1_Id, finalMatch.player2_Id, finalMatch.id);
  
  // Mise à jour du match pour indiquer qu'il est en cours
  finalMatch.status = 'in_progress';
  finalMatch.gameSessionId = gameSessionId;
  console.log(`Match final lancé avec gameSessionId: ${gameSessionId}`);
}


