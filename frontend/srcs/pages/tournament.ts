import { getMatchmakingSocket } from "../wsClient";
import { fetchUserProfile } from "./mode";
import i18n from '../i18n';

let ws: WebSocket;
let cleanupDone = false;
let wsHandler: (ev: MessageEvent) => void; 

export default async function Tournament_mgt() {
    const app = document.getElementById('app');
	const userProfile = await fetchUserProfile();
	console.log(userProfile);
	if (!userProfile) {
		console.error(i18n.t('profile.noUserConnected'));
		return;
	}
	const currentPlayerId =  userProfile.userId;
	console.log(`${i18n.t('profile.currentPlayerId')}:`, currentPlayerId);
	attachWebSocketHandlers();

    if (app) {
      app.innerHTML = /*html*/`
		<div id="tournament-root" class="flex flex-col items-center justify-center min-h-screen">
		<h1 class="text-4xl font-bold mb-6">${i18n.t('tournament.title')}</h1>
		<div id="stage" class="text-2xl"></div>   <!-- zone mutable -->
		<button id="leaveBtn" class="mt-8 bg-gray-700 px-4 py-2 rounded text-white">
			${i18n.t('tournament.leave')}
		</button>
		</div>
	`;
	  (document.getElementById('leaveBtn')! as HTMLButtonElement)
	  .addEventListener('click', leaveTournament);
	
    }
	
}

function attachWebSocketHandlers() {
	ws = getMatchmakingSocket()!;
	if (wsHandler) ws.removeEventListener('message', wsHandler);
	wsHandler = (ev: MessageEvent) => onWsMessage(ev);
	ws.addEventListener('message', wsHandler);
	window.addEventListener('beforeunload', leaveTournament);
}

function leaveTournament() {
	if (cleanupDone) return;
	cleanupDone = true;
	ws.send(JSON.stringify({ action: 'TOURNAMENT_LEAVE', payload: {} }));
  	ws.removeEventListener('message', wsHandler);
	window.removeEventListener('beforeunload', leaveTournament);
}

async function onWsMessage(ev: MessageEvent) {
	let msg;
	try { msg = JSON.parse(ev.data); } catch { return; }
	switch (msg.type) {
		case 'MATCH_PREP':
			const {gameSessionId, delay} = msg.payload;
			console.log(i18n.t('tournament.matchPrep'));
			startCountdown(delay, () => {
				history.pushState(null, '', `/game?gameSessionId=${gameSessionId}`);
				window.dispatchEvent(new PopStateEvent('popstate'));
			});
			break;
		case 'MATCH_START':
			console.log(i18n.t('tournament.matchOfficiallyStarted'));
			break;
	
		// case 'MATCH_END':
		// 	// msg.payload = { score1, score2, winnerId }
		// 	const {winner_Id, score1, score2} = msg.payload;
 		// 	const isWinner = winner_Id === myId;
		// 	show1v1ResultScreen(isWinner, {score1, score2});
		//   break;
	
		case 'PLAYER_STATE_UPDATE':
		  // msg.payload = { state: 'eliminated' | 'waiting_next_round' | 'winner' }
			updatePlayerStateUI(msg.payload.state);
			break;
	
	  }
}


export function startCountdown(sec: number, onEnd: () => void) {

  let stage = document.getElementById('stage') as HTMLElement | null;

  if (!stage) {
    stage         = document.createElement('div');
    stage.id      = 'stage';
    stage.className = 'text-2xl font-bold my-4';
    document.getElementById('app')?.prepend(stage);
  }

  let t = sec;
  stage.textContent = i18n.t('tournament.matchStartsIn', { seconds: t });

  const timer = setInterval(() => {
	  t--;
	  if (t === 0) {
		  clearInterval(timer);
		  stage.remove();
		  onEnd();
		  return;
    }
    stage.textContent = i18n.t('tournament.matchStartsIn', { seconds: t });
  }, 1_000);
}


// export function updateTournamentUI(state: TournamentState) {
// 	console.log("updateTournamentState", state);
// 	const app = document.getElementById('app');
// 	if (!app) return;

// 	switch (state) {
// 		case 'tournament_launch':
// 			app.innerHTML = `
// 				<div class="flex flex-col items-center justify-center min-h-screen bg-white text-black">
// 					<h2 id="countdown"
// 						class="text-4xl font-bold font-jaro mb-8">
// 					Préparation du tournoi…
// 					</h2>
// 				</div>`;
// 			break;
// 		default:
// 			app.innerHTML = `<p>État du tournoi : ${state}</p>`;
// 			break;
// 	}
// }



export function updatePlayerStateUI(state: string) {
	const app = document.getElementById('app');
	if (!app) return;
  
	switch (state) {

		case 'eliminated':
			app.innerHTML = `
				<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
					<h2 class="text-2xl font-bold mb-4">${i18n.t('tournament.playerEliminated')}</h2>
					<p class="text-gray-600">${i18n.t('tournament.tryAgainNextTime')}</p>
					<button id="backToMenuBtn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">${i18n.t('tournament.backToMenu')}</button>
				</div>
			`;
		  break;
	  
		case 'waiting_next_round':
			app.innerHTML = `
				<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
					<h2 class="text-2xl font-bold mb-4">${i18n.t('tournament.congratsMatchWin')}</h2>
					<p class="text-gray-600">${i18n.t('tournament.waitingNextRound')}</p>
				</div>
			`;
		  break;

		case 'waiting_final_prep':
			app.innerHTML = `
				<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
					<h2 class="text-2xl font-bold mb-4">${i18n.t('tournament.congratsMatchWin')}</h2>
					<p class="text-gray-600">${i18n.t('tournament.finalPreparation')}</p>
				</div>
			`;
		  break;
	  
		case 'winner':
			app.innerHTML = `
				<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
					<h2 class="text-2xl font-bold mb-4">${i18n.t('tournament.congratsTournamentWin')}</h2>
					<p class="text-gray-600">${i18n.t('tournament.championCongrats')}</p>
					<button id="backToMenuBtn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">${i18n.t('tournament.backToMenu')}</button>
				</div>
			`;
		  break;
	  
		default:
			app.innerHTML = `
				<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
					<h2 class="text-2xl font-bold mb-4">${i18n.t('tournament.playerState', { state })}</h2>
					<p class="text-gray-600">${i18n.t('tournament.waitingForInfo')}</p>
				</div>
			`;
	}
	const backToMenuBtn = document.getElementById('backToMenuBtn');
	backToMenuBtn?.addEventListener('click', () => {
		history.pushState(null, '', '/menu');
		window.dispatchEvent(new PopStateEvent('popstate'));
	});
  }


//   function handlePlayerStateUpdate(playerState: string) {
// 	currentPlayerState = playerState;
// 	console.log("Nouveau playerState =", currentPlayerState);
// 	updatePlayerStateUI(currentPlayerState);
//   }