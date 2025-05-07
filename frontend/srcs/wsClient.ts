import { updatePlayerStateUI} from "./pages/tournament";
import { TournamentState } from "./types";
import { Tournament } from "./types";


let userSocket: WebSocket | null = null;
let matchmakingSocket: WebSocket | null = null;
let currentPlayerState: string | null = null;

export let currentTournamentState: TournamentState | null = null;
export let currentTournamentData: Tournament | null = null;

export function userWebSocket(userId: string): WebSocket {
	const baseUrl = window.location.origin.replace(/^https?:\/\//, '');
	const ws = new WebSocket(`wss://${baseUrl}/user/ws?playerId=${userId}`);
	ws.onopen = () => {
		console.log('Connexion WebSocket vers le service user établie');
	};
	//message provenant du back vers le front
	ws.onmessage = (event) => {
		try{
			const msg = JSON.parse(event.data);
			console.log('Notification user WebSocket reçue:', msg);
			switch(msg.type) {
				case 'userDisconnected':
					history.pushState(null, '', `/game?gameSessionId=${msg.gameSessionId}`);
					window.dispatchEvent(new PopStateEvent('popstate'));
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
	const baseUrl = window.location.origin.replace(/^https?:\/\//, '');
	const ws = new WebSocket(`wss://${baseUrl}/matchmaking/ws?playerId=${userId}`);

	ws.addEventListener('open',  () => console.log('[WS] open'));
	ws.addEventListener('close', () => console.log('[WS] closed'));
	ws.addEventListener('error', e => console.error('[WS] error', e));
	matchmakingSocket = ws;
	return (ws)
}
	// ws.onopen = () => {
	// 	console.log('Connexion WebSocket matchmaking établie');
	// };
	// message recu du back impactant le front
// 	ws.onmessage = (event) => {
// 		try{
// 			const msg = JSON.parse(event.data);
// 			console.log('Notification WebSocket matchmaking reçue:', msg);
// 			switch(msg.type) {
// 				// case 'launch_tournament':
// 				// 	const tournament_Id = msg.payload?.tournament?.id;
// 				// 	if (tournament_Id) {
// 				// 		console.log("Tournoi lancé avec ID :", tournament_Id);
// 				// 		history.pushState(null, '', `/tournament?tournament_Id=${tournament_Id}`);
// 				// 		window.dispatchEvent(new PopStateEvent('popstate'));
// 				// 	}
// 				// break;
// 				case 'MATCH_START':
// 					const {state, tournament} = msg.payload;
// 					const tournament_Id2 = tournament.id;
// 					history.pushState(null, '', `/tournament?tournament_Id=${tournament_Id2}`);
// 					window.dispatchEvent(new PopStateEvent('popstate'));
// 					currentTournamentState = state;
// 					currentTournamentData = tournament;
// 					console.log("tournament state", currentTournamentState);
// 					break;
// 				// case 'MATCH_START':
// 				// 	const {gameSessionId} = msg.payload;
// 				// 	console.log("gameSessionId", gameSessionId);
// 				// 	history.pushState(null, '', `/game?gameSessionId=${gameSessionId}`);
// 				// 	window.dispatchEvent(new PopStateEvent('popstate'));
// 				// 	break;
// 				case 'player_state_update':
// 					const {state: playerState, tournament: playerTournament} = msg.payload;
// 					history.pushState(null, '', `/tournament?tournament_Id=${playerTournament.id}`);
// 					window.dispatchEvent(new PopStateEvent('popstate'));
// 					console.log("player_state", playerState);
// 					handlePlayerStateUpdate(playerState);
// 					break;
// 				case 'MATCH_END':
// 					const {winner_Id, score1, score2} = msg.payload;
// 					const isWinner = winner_Id === userId;
// 					show1v1ResultScreen(isWinner, {score1, score2});
// 					break;
// 				default:
// 					break;
// 			}
// 		} catch (error) {
// 			console.error('Erreur lors du parsing du message matchmaking:', error);
// 		}
// 	};
	
// 	ws.onerror = (error) => {
// 		console.error('Erreur WebSocket matchmaking:', error);
// 	};
	
// 	ws.onclose = () => {
// 		console.log('Connexion WebSocket matchmaking fermée');
// 	};
// 	matchmakingSocket = ws;
// 	return ws;
// }


export function getMatchmakingSocket(): WebSocket | null {
	return matchmakingSocket;
}
export function getUserSocket(): WebSocket | null {
	return userSocket;
}

function handlePlayerStateUpdate(playerState: string) {
	currentPlayerState = playerState;
	console.log("Nouveau playerState =", currentPlayerState);
	updatePlayerStateUI(currentPlayerState);
}

function show1v1ResultScreen(
	isWinner: boolean,
	scores: { score1: number; score2: number }
  ) {
	const app = document.getElementById('app');
	if (!app) return;
  
	app.innerHTML = `
	  <div class="min-h-screen flex flex-col items-center justify-center bg-white text-black px-4">
		<h2 class="text-3xl font-bold mb-4">
		  ${isWinner ? '🎉 Victoire !' : '😢 Défaite'}
		</h2>
  
		<p class="mb-6 text-lg">Score : ${scores.score1} – ${scores.score2}</p>
  
		<button id="backBtn"
				class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded">
		  Retour au menu
		</button>
	  </div>
	`;
  
	document.getElementById('backBtn')?.addEventListener('click', () => {
		history.pushState(null, '', '/menu');
		window.dispatchEvent(new PopStateEvent('popstate'));
	});
}
 