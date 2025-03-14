import { v4 as uuidv4 } from 'uuid';
import { createGameSession } from './matchmakingController';
import { getMatchbyId, getTournamentById, Match, Tournament, updateMatchv2 } from './matchmakingDb';

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

export async function launchMatch(matchId: string): Promise<Match | undefined> {
	const match = getMatchbyId(matchId);
	if (!match) {
		throw new Error("Aucun match avec cet id.");
	}
	if (match.status !== 'scheduled') {
		throw new Error("Match deja lance");
	}
	console.log(match);
	console.log(`Lancement du match ${match.id} entre le joueur ${match.player1_Id} et le joueur ${match.player2_Id}`);
	const gameSessionId = await createGameSession(match.player1_Id, match.player2_Id, match.id);
	if (!gameSessionId) {
		throw new Error("La session de jeu n'a pas pu être créée.");
	}
	console.log(` la game session est: ${gameSessionId}`)
	match.status = 'in_progress';
	console.log(`match ${match.id} lance avec gameSessionId: ${gameSessionId}`);
	updateMatchv2(match);
	return (match);
}


// export async function launchFinalMatch(finalMatch: Match): Promise<void> {
//   // Appeler le service Game pour démarrer la partie finale
//   const gameSessionId = await createGameSession(finalMatch.player1_Id, finalMatch.player2_Id, finalMatch.id);
  
//   // Mise à jour du match pour indiquer qu'il est en cours
//   finalMatch.status = 'in_progress';
//   finalMatch.gameSessionId = gameSessionId;
//   console.log(`Match final lancé avec gameSessionId: ${gameSessionId}`);
// }


