import {updateTournamentUI} from './pages/tournament';
import { Tournament, TournamentState } from "./types";

let userSocket: WebSocket | null = null;
let matchmakingSocket: WebSocket | null = null;

export function userWebSocket(userId: string): WebSocket {
	const ws = new WebSocket(`ws://localhost:4000/api-user/ws?playerId=${userId}`);
	ws.onopen = () => {
		console.log('Connexion WebSocket vers le service user établie');
	};

	ws.onmessage = (event) => {
		try{
			const msg = JSON.parse(event.data);
			console.log('Notification user WebSocket reçue:', msg);
			switch(msg.type) {
				case 'userDisconnected':
					history.pushState(null, '', `/game?gameSessionId=${msg.gameSessionId}`);
					window.dispatchEvent(new PopStateEvent('popstate'));
					break;
				case 'jointournament':
					break;
				default:
					break;
			}
		} catch (error) {
			console.error('Erreur lors du parsing du message user:', error);
		}
	};
	
	ws.onerror = (error) => {
		console.error('Erreur WebSocket user:', error);
	};
	
	ws.onclose = () => {
		console.log('Connexion WebSocket user fermée');
	};
	userSocket = ws;
	return ws;
}

export function matchmakingWebSocket(userId: string): WebSocket {
	console.log("test_websocket", userId);
	const ws = new WebSocket(`ws://localhost:4000/api-matchmaking/ws?playerId=${userId}`);
	ws.onopen = () => {
		console.log('Connexion WebSocket matchmaking établie');
	};

	// message recu du back impactant le front
	ws.onmessage = (event) => {
		try{
			const msg = JSON.parse(event.data);
			console.log('Notification WebSocket matchmaking reçue:', msg);
			switch(msg.type) {
				case 'launch_1v1':
					history.pushState(null, '', `/game?gameSessionId=${msg.gameSessionId}`);
					window.dispatchEvent(new PopStateEvent('popstate'));
					break;
				case 'launch_tournament':
					const tournamentId = msg.payload?.tournament?.id;
					if (tournamentId) {
						console.log("Tournoi lancé avec ID :", tournamentId);
						history.pushState(null, '', `/tournament?tournamentId=${tournamentId}`);
						window.dispatchEvent(new PopStateEvent('popstate'));
					}
					break;
				case 'tournament_state_update':
					const state = msg.payload.state as TournamentState;
					const tournament = msg.payload.tournament;
					updateTournamentUI(state, tournament);
					break;
				default:
					break;
			}
		} catch (error) {
			console.error('Erreur lors du parsing du message matchmaking:', error);
		}
	};
	
	ws.onerror = (error) => {
		console.error('Erreur WebSocket matchmaking:', error);
	};
	
	ws.onclose = () => {
		console.log('Connexion WebSocket matchmaking fermée');
	};
	matchmakingSocket = ws;
	return ws;
}


export function getMatchmakingSocket(): WebSocket | null {
	return matchmakingSocket;
}
  
  export function getUserSocket(): WebSocket | null {
	return userSocket;
  }
