import axios from 'axios';
import type { WebSocket as WS } from 'ws';
import {createTournament, Tournament, getMatchbyId, Match, updateMatchv2, scheduleFinal} from './matchmakingDb';
import { websocketClients } from './matchmakingRoutes';
import WebSocket from 'ws';
import { getTournamentById } from './matchmakingDb';

export const queue1v1: string[] = [];
export const queueTournament: string[] = [];
export const tournamentReadiness: Map<string, Set<string>> = new Map();



//join 1v1 queue
export async function joinQueue1v1(playerId: string) {
	queue1v1.push(playerId);
	console.log(queue1v1);
	attemptMatch();
}

//join tournament 1
export async function joinTournamentQueue(playerId: string) {
	queueTournament.push(playerId);
	console.log("queueTournament:", queueTournament);
}

export async function launchMatch(matchId: string): Promise<Match | undefined> {
	const match = getMatchbyId(matchId);
	if (!match) {
		throw new Error("Aucun match avec cet id.");
	}
	if (match.status !== 'ready') {
		throw new Error("Match deja lance");
	}
	console.log(match);
	console.log(`Lancement du match ${match.id} entre le joueur ${match.player1_Id} et le joueur ${match.player2_Id}`);
	const gameSessionId = await createGameSession(match.player1_Id, match.player2_Id, match.id);
	if (!gameSessionId) {
		throw new Error("La session de jeu n'a pas pu être créée.");
	}
	if (gameSessionId) {
		const message = JSON.stringify({
			gameSessionId
		});
		websocketClients.forEach((socket) => {
			socket.send(message);
		})
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
						type: 'launch_1v1',
						gameSessionId
					});
					const socket1 = websocketClients.get(player1);
					const socket2 = websocketClients.get(player2);

					socket1?.send(message);
					socket2?.send(message);
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
			const message = JSON.stringify({
				type: 'launch_tournament',
				payload: {tournament}
			});
			players.forEach((playerId) => {
				const socket = websocketClients.get(playerId!);
				if (socket && socket.readyState === WebSocket.OPEN) {
					socket.send(message);
				}
			});
			console.log("Tournoi cree:", tournament);
			return (tournament);
		}
	} 
}

export function onMatchCompleted(tournamentId: string, matchId: string): void {
	const tournament = getTournamentById(tournamentId);
	if (!tournament) return;

	const match = tournament.matches.find(m => m.id === matchId);
	if (!match) return;

	const semiFinals = tournament.matches.filter(m => m.round === 1);
	const allDone = semiFinals.every(m => m.status === 'completed');

	if (allDone) {
		console.log(`[MM] Demi-finales terminées, lancement de la finale`);
		scheduleFinal(tournament.id);
		const final_match_id = tournament.matches.find(m => m.round === 2);
		if (final_match_id?.id) {
			launchMatch(final_match_id.id);
		} else {
			console.error("Finale non trouvee");
		}
	}
}

interface MatchmakingMessage {
	action: string;
	payload?: any;
}

//Message du back vers le front
function broadcastTournamentState(tournament: Tournament) {
	const message = JSON.stringify({
		type: 'tournament_state_update',
		payload: {
			tournamentId: tournament.id,
			state: tournament.state,
			tournament
		}
	});

	for (const playerId of tournament.players) {
		const socket = websocketClients.get(playerId);
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(message);
		}
	}
}

export async function handleMatchmakingMessage(
	msg: MatchmakingMessage,
	playerId: string,
	clients: Map<string, WebSocket>
  ) {
	// message provenant du front vers le back
	switch (msg.action) {
		case 'join_1v1':
			console.log(`[MM] ${playerId} rejoint la file 1v1`);
			joinQueue1v1(playerId);
			break;
	  
		case 'join_tournament':
			console.log(`[MM] ${playerId} rejoint la file tournoi`);
			joinTournamentQueue(playerId);
			const tournament = await attemptTournament();
			if (tournament) {
				//tournament.state = 'tournament_queue';
				broadcastTournamentState(tournament);
			}
			break;
		case 'semi_final_end':
			
		
		case 'leave_tournament':
			console.log(`[MM] ${playerId} quitte la file tournoi`);
			// tu peux faire queueTournament = queueTournament.filter(p => p !== playerId);
			break;
  
		default:
			console.warn(`[MM] Action inconnue : ${msg.action}`);
			const ws = clients.get(playerId);
			if (ws?.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({ error: 'Action inconnue' }));
			}
	}
}