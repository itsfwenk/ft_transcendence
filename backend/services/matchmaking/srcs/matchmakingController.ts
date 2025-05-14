import axios from 'axios';
import type { WebSocket as WS } from 'ws';
import {createMatch, createTournament, getTournamentById, Tournament, getMatchbyId, Match, updateMatchv2, scheduleFinal} from './matchmakingDb';
import { websocketClients } from './matchmakingRoutes';
import WebSocket from 'ws';

export const queue1v1 = new Set<string>();
export const queueTournament = new Set<string>();
export const tournamentReadiness: Map<string, Set<string>> = new Map();

export type PlayerTournamentState =
|	'in_queue'
|	'eliminated'
|	'waiting_next_round'
|	'winner';

const playerStates = new Map<string, PlayerTournamentState>();

export function setPlayerState(playerId: string, state:PlayerTournamentState) {
	playerStates.set(playerId, state);
}

export function getPlayerState(playerId: string) {
	return playerStates.get(playerId);
}

//join 1v1 queue
export async function joinQueue1v1(playerId: string) {
	if (queue1v1.has(playerId)) return;
	queue1v1.add(playerId);
	broadcastToQueue(queue1v1, {
		type: 'QUEUE_1V1_PLAYER_JOINED',
		playerId
	});
	console.log(`Joueur ${playerId} a rejoint de la queue 1v1`)
	console.log(queue1v1);
}

export async function leaveQueue1v1(playerId: string) {
	if (!queue1v1.delete(playerId)) return;
	broadcastToQueue(queue1v1, {
		type     : 'QUEUE_1V1_PLAYER_LEFT',
		playerId
	  });
	console.log(`Joueur ${playerId} retiré de la queue 1v1`);
	console.log('Queue 1v1 actuelle :', queue1v1);
}

export async function fetchPublicProfile(playerId: string) {
	const USER_SVC = process.env.USER_SERVICE_BASE_URL ?? 'http://user:4001';
	const { data } = await axios.get(
		`${USER_SVC}/user/public/${playerId}`
	);
	return data as { userId: string; userName: string; avatarUrl: string };
}

//join tournament 1
export async function joinTournamentQueue(playerId: string) {
	if (queueTournament.has(playerId)) return;
	queueTournament.add(playerId);
	const playersList = await Promise.all(
		[...queueTournament].map(async id => {
		  const pub = await fetchPublicProfile(id);
		  console.log("pub", pub);
		  return {
			userId   : pub.userId,
			userName : pub.userName,
			avatarUrl: pub.avatarUrl
		  };
		})
	);
	console.log("playersList", playersList);
	// const ws = websocketClients.get(playerId);
	// if (ws?.readyState === WebSocket.OPEN) {
	// ws.send(
	// 	JSON.stringify({
	// 	type   : 'QUEUE_SNAPSHOT',
	// 	players: playersList
	// 	})
	// );
	// }
	// broadcastToQueue(queueTournament, {
	// 	type: 'QUEUE_TOURNAMENT_PLAYER_JOINED',
	// 	playerId
	// });
		broadcastToQueue(queueTournament, {
		type: 'QUEUE_SNAPSHOT',
		players: playersList
	});
	console.log(`Joueur ${playerId} a rejoint de la queue Tournament`)
	console.log(queueTournament);
}

export async function leaveTournamentQueue(playerId: string) {
	if (!queueTournament.delete(playerId)) return;
	broadcastToQueue(queueTournament, {
		type     : 'QUEUE_TOURNAMENT_PLAYER_LEFT',
		playerId
	  });
	console.log(`Joueur ${playerId} retiré de la queue tournament`);
	console.log('Queue Tournament actuelle :', queueTournament);
}

function broadcastToQueue(setQueue: Set<string>, msg: unknown) {
	const str = JSON.stringify(msg);
  
	setQueue.forEach(playerId => {
	  const ws = websocketClients.get(playerId);
	  if (ws && ws.readyState === WebSocket.OPEN) ws.send(str);
	});
}

export async function  launchMatch(matchId: string): Promise<Match | undefined> {
	const match = getMatchbyId(matchId);
	if (!match) {
		throw new Error("Aucun match avec cet id.");
	}
	console.log("launch match", match);
	if (match.status !== 'pending') {
		throw new Error("Match deja lance");
	}
	console.log(`Lancement du match ${match.id} entre le joueur ${match.player1_Id} et le joueur ${match.player2_Id}`);
	const gameSessionId = await createGameSession(match.player1_Id, match.player2_Id, match.id);
	if (!gameSessionId) {
		throw new Error("La session de jeu n'a pas pu être créée.");
	}
	if (gameSessionId) {
		const socket1 = websocketClients.get(match.player1_Id);
		const socket2 = websocketClients.get(match.player2_Id);
		const message1 = JSON.stringify({
			type: 'MATCH_START',
			payload: {
				gameSessionId,
				matchId: match.id,
				opponentId: match.player2_Id
			}
		});
		const message2 = JSON.stringify({
			type: 'MATCH_START',
			payload: {
				gameSessionId,
				matchId: match.id,
				opponentId: match.player1_Id
			}
		});
		socket1?.send(message1);
		socket2?.send(message2);

	}
	console.log(` la game session est: ${gameSessionId}`)
	match.status = 'in_progress';
	console.log(`match ${match.id} lance avec gameSessionId: ${gameSessionId}`);
	updateMatchv2(match);
	return (match);
}

export async function createGameSession(player1_id:string, player2_id:string, matchId:string): Promise<string | undefined> {
	try {
		const baseUrl = process.env.GAME_SERVICE_BASE_URL || 'http://game:4002';
		let response;
		console.log(matchId);
		response = await axios.post(`${baseUrl}/game/start`, {player1_id, player2_id, matchId});
		console.log('Partie creee:', response.data);
		return response.data.game.gameId;
	} catch (error) {
		console.error('Erreur lors du lancement de la partie:', error);
		throw error;
	}
}

// export async function attemptMatch() {
// 	if (queue1v1.length >= 2) {
// 		const player1 = queue1v1.shift();
// 		const player2 = queue1v1.shift();
// 		if (player1 && player2) {
// 			console.log('creating a matching betweenm', player1, player2)
// 			try {
// 				const gameSessionId = await createGameSession(player1, player2);
// 				if (gameSessionId) {
// 					const message = JSON.stringify({
// 						type: 'launch_1v1',
// 						gameSessionId
// 					});
// 					const socket1 = websocketClients.get(player1);
// 					const socket2 = websocketClients.get(player2);

// 					socket1?.send(message);
// 					socket2?.send(message);
// 				}
// 			} catch (error) {
// 				console.error('Erreur lors de la création de la game session:', error);
// 			}
// 		}
	
// 	}
// }



export async function attemptMatchv2(): Promise<Match | undefined>  {
	if (queue1v1.size >= 2) {
		const player1 = queue1v1.values().next().value as string | undefined;
		if (player1) queue1v1.delete(player1);
		const player2 = queue1v1.values().next().value as string | undefined;
		if (player2) queue1v1.delete(player2);
		if (player1 && player2) {
			console.log('creating a matching betweenm', player1, player2)
			try {
				const match: Match = createMatch(player1, player2, 0);
				console.log("Match attempt", match);
				return (match);
			} catch (error) {
				console.error('Erreur lors de la création de la game session:', error);
			}
		}
	}
}

export async function attemptTournament(): Promise<Tournament | undefined> {
	console.log(queueTournament);
	console.log("attemptTournament", queueTournament);
	if (queueTournament.size >= 4) {
		const it = queueTournament.values();
		const player1 = it.next().value as string | undefined;
		console.log("Player1", player1);
		const player2 = it.next().value as string | undefined;
		const player3 = it.next().value as string | undefined;
		const player4 = it.next().value as string | undefined;

		[player1, player2, player3, player4].forEach(p => p && queueTournament.delete(p));
		if (player1 && player2 && player3 && player4) {
            let players: string[] = [player1, player2, player3, player4];
			console.log('creating a tournament between')
			const tournament = createTournament(players);
			if (!tournament) {
				throw Error ("No tournament created");
			}
			const message = JSON.stringify({
				type: 'TOURNAMENT_LAUNCH',
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

export function onMatchCompleted(matchId: string): void {
	const match: Match = getMatchbyId(matchId);
	if (!match) {
		console.error("Match is undefined");
		return;
	}
	if (match.status !== "completed") return;
	console.log("OnMatchCompleted", match);
	const p1 = match.player1_Id;
	const p2 = match.player2_Id;
	const winner_Id = match.winner_Id
	const score1 = match.player1Score;
	const score2 = match.player2Score;
	if (!winner_Id) {
		console.error("Winner ID is undefined");
		return;
	}
	const loserId = (p1 === winner_Id) ? p2 : p1;
	if (!loserId) {
		console.error("loser_id not defined");
		return;
	}
	const tournament_Id = match.tournament_Id;
	console.log(tournament_Id);
	if (tournament_Id) {
		const tournament = getTournamentById(tournament_Id);
		if (!tournament) return;

		//const match = tournament.matches.find(m => m.id === matchId);
		setPlayerState(loserId, 'eliminated');
		const losersocket = websocketClients.get(loserId);
		losersocket?.send(JSON.stringify({
			type: 'PLAYER_STATE_UPDATE',
			payload: {
				state: 'eliminated',
				tournament
			}
		}));
		const semiFinals = tournament.matches.filter(m => m.round === 1);
		const semiDone = semiFinals.every(m => m.status === 'completed');
		const final_match = tournament.matches.find(m => m.round === 2);
		const finalDone = final_match?.status === 'completed';
		console.log("final Done ? ", finalDone);
		console.log("Semi Done ? ", semiDone);
		if (finalDone) {
			console.log("final Done ? ", finalDone);
			setPlayerState(winner_Id, 'winner');
			const tournamentWinnerSocket = websocketClients.get(winner_Id);
			tournamentWinnerSocket?.send(JSON.stringify({
				type: 'PLAYER_STATE_UPDATE',
				payload: {
					state: 'winner',
					tournament
				}
			}));
		} else if (semiDone) {
			console.log(`[MM] Demi-finales terminées, lancement de la finale`);
			scheduleFinal(tournament.id);
			const updatedtournament = getTournamentById(tournament_Id);
			if (!updatedtournament) return;
			console.log("updated_tournament_with_final", updatedtournament);
			const final_match = updatedtournament.matches.find(m => m.round === 2);
			console.log("final_match", final_match);
			if (final_match?.id) {
				launchMatch(final_match.id);
			} else {
				console.error("Finale non trouvee");
			}
		} else {
			setPlayerState(winner_Id, 'waiting_next_round')
			const winnersocket = websocketClients.get(winner_Id);
			winnersocket?.send(JSON.stringify({
				type: 'PLAYER_STATE_UPDATE',
				payload: {
					state: 'waiting_next_round',
					tournament
				}
			}));
		}
	} else {
		const winnersocket = websocketClients.get(winner_Id);
		const losersocket = websocketClients.get(loserId);
		const payload = {
			type: 'MATCH_END',
			payload: {
			  matchId,
			  winner_Id,
			  score1,
			  score2
			}
		  };
		winnersocket?.send(JSON.stringify(payload));
		losersocket?.send(JSON.stringify(payload));

	}
}

interface MatchmakingMessage {
	action: string;
	payload?: any;
}

//diffusion d'un etat a tous les joueurs
function broadcastTournamentState(tournament: Tournament) {
	const message = JSON.stringify({
		type: 'tournament_state_update',
		payload: {
			tournament_Id: tournament.id,
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

// message provenant du front vers le back
export async function handleMatchmakingMessage(
	msg: MatchmakingMessage,
	playerId: string,
	clients: Map<string, WebSocket>
  ) {

	const action = msg.action.trim();
	console.log('ACTION =', JSON.stringify(action));
	switch (action) {
		case 'QUEUE_JOIN_1V1':
			console.log(`[MM] ${playerId} rejoint la file 1v1`);
			joinQueue1v1(playerId);
			const match = await attemptMatchv2();
			if (match) {
				launchMatch(match.id);
			}
			break;
	  
		case 'QUEUE_JOIN_TOURNAMENT':
			console.log(`[MM] ${playerId} rejoint la file tournoi`);
			joinTournamentQueue(playerId);
			const tournament = await attemptTournament();
			if (tournament) {
				tournament.state = 'tournament_launch';
				broadcastTournamentState(tournament);
				setTimeout(() => {
					const semiFinals = tournament.matches.filter(m => m.round === 1);
					console.log("voici les demis finales", semiFinals);
					for (const match of semiFinals) {
						console.log("match qui va etre lance", match.id);
						launchMatch(match.id);
					}
				}, 5000);
			}
			break;		
		
		case 'QUEUE_LEAVE_1V1':
			leaveQueue1v1(playerId);
			break;
		case 'QUEUE_LEAVE_TOURNAMENT':
			leaveTournamentQueue(playerId);
			break;

		default:
			console.warn(`[MM] Action inconnue : ${msg.action}`);
			const ws = clients.get(playerId);
			if (ws?.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({ error: 'Action inconnue' }));
			}
	}
}