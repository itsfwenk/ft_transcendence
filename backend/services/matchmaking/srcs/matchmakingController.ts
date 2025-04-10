import axios from 'axios';
import type { WebSocket as WS } from 'ws';
import {createTournament, Tournament, getMatchbyId, Match, updateMatchv2} from './matchmakingDb';
import { websocketClients } from './matchmakingRoutes';


export const queue1v1: string[] = [];
export const queueTournament: string[] = [];


//join 1v1 queue
export async function joinQueue1v1(playerId: string) {
	queue1v1.push(playerId);
	console.log(queue1v1);
	attemptMatch();
}

//join tournament 1
export async function joinTournamentQueue(playerId: string) {
	queueTournament.push(playerId);
	console.log(queueTournament);
}

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

export async function createGameSession(player1_id:string, player2_id:string, matchId?:string): Promise<string | undefined> {
	try {
		const baseUrl = process.env.GAME_SERVICE_BASE_URL || 'http://localhost:4000/api-game';
		let response;
		if (matchId) {
			console.log(matchId);
			response = await axios.post(`${baseUrl}/game/start`, {player1_id, player2_id, matchId});
		} else {
			response = await axios.post(`${baseUrl}/game/start`, {player1_id, player2_id});
		}
		console.log('Partie creee:', response.data);
		return response.data.game.gameId;
	} catch (error) {
		console.error('Erreur lors du lancement de la partie:', error);
		throw error;
	}
}

async function attemptMatch() {
	if (queue1v1.length >= 2) {
		const player1 = queue1v1.shift();
		const player2 = queue1v1.shift();
		if (player1 && player2) {
			console.log('creating a matching betweenm', player1, player2)
			try {
				const gameSessionId = await createGameSession(player1, player2);
				if (gameSessionId) {
					const message = JSON.stringify({
						gameSessionId
					});
					websocketClients.forEach((socket) => {
						socket.send(message);
					})
				}
			} catch (error) {
				console.error('Erreur lors de la création de la game session:', error);
			}
		}
	
	}
}

export async function attemptTournament(): Promise<Tournament | undefined> {
	console.log(queueTournament);
	if (queueTournament.length >= 4) {
		const player1 = queueTournament.shift();
		const player2 = queueTournament.shift();
		const player3 = queueTournament.shift();
		const player4 = queueTournament.shift();
		if (player1 && player2 && player3 && player4) {
            let players: string[] = [player1, player2, player3, player4];
			console.log('creating a tournament between')
			const tournament = createTournament(players);
			if (!tournament) {
				throw Error ("No tournament created");
			}
			console.log("Tournoi cree:", tournament);
			return (tournament);
		}
	} else {
		throw Error ("Pas assez de joueurs dans la Tournament Queue");
	}
}