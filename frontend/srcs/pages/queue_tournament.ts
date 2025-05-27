import { fetchUserProfile } from "./mode";
import { getMatchmakingSocket } from "../wsClient";
import { getAvatarUrl } from "./profile";
import i18n from '../i18n';

export default async function Queuetournament() {
	const app = document.getElementById('app');
	if (!app) return;
  
	const userProfile = await fetchUserProfile();
	console.log(userProfile);
	if (!userProfile) {
		console.error(i18n.t('profile.noUserConnected'));
		return;
	}
	const currentPlayerId = userProfile.userId;
	console.log(`${i18n.t('profile.currentPlayerId')}:`, currentPlayerId);

	const currentPlayerAvatar = getAvatarUrl(currentPlayerId);
	console.log(`${i18n.t('profile.currentPlayerAvatar')}:`, currentPlayerAvatar);
  
	app.innerHTML = /*html*/ `
	<div class="text-black font-jaro text-9xl mt-16 mb-36 select-none">${i18n.t('general.pongGame')}</div>
    <div class="flex flex-col items-center justify-center">
      <div class="flex flex-col items-center justify-center w-1/3 bg-blue-700 rounded-md">
      <h1 class="text-6xl mb-9 pt-2 font-jaro">${i18n.t('tournament.title')}</h1>
      <div id="queue-list" class="flex flex-wrap justify-center gap-3">
	  
	  
      </div>
      <p id="status-message" class="text-white font-inria font-bold pt-5 m-5">${i18n.t('queue.searchingOpponents')}</p>
      </div>
      <div id="backBtn" class='button w-24 h-13 mt-10 bg-gray-700 rounded-full cursor-pointer select-none
      hover:translate-y-2 hover:[box-shadow:0_0px_0_0_#000000,0_0px_0_0_#00000041]
      hover:border-b-[0px]
      transition-all duration-150 [box-shadow:0_10px_0_0_#000000,0_15px_0_0_#00000041]
      border-b-[1px] border-gray-400'>
      <span class='flex flex-col justify-center items-center h-full text-white font-jaro'>${i18n.t('general.back')}</span>
      </div>
    </div>
  `;

	const queueList = document.getElementById('queue-list')!;
	for (let i = 0; i < 4; i++) {
		queueList.insertAdjacentHTML(
			'beforeend',
			`<div class="slot w-16 h-16 bg-white rounded-md cube-3d overflow-hidden"
				data-filled="false"></div>`
		);
	}
	type QueuePlayer = { userId: string; userName: string; avatarUrl: string };

	const slots = Array.from(
	document.querySelectorAll<HTMLDivElement>('#queue-list .slot')
	);

	function addPlayerToSlot(p: QueuePlayer) {
	if (document.querySelector(`[data-user-id="${p.userId}"]`)) return;

	const slot = slots.find(s => s.dataset.filled === 'false');
	if (!slot) return; // queue full

	slot.dataset.filled = 'true';
	slot.dataset.userId = p.userId;

	slot.innerHTML = `
		<img src="${p.avatarUrl || '/avatars/default.png'}"
			alt="${p.userName}"
			class="w-full h-full object-cover" />`;
	}

	function removePlayerFromSlot(userId: string) {
	const slot = document.querySelector<HTMLDivElement>(
		`.slot[data-user-id="${userId}"]`
	);
	if (!slot) return;

	slot.dataset.filled = 'false';
	slot.removeAttribute('data-user-id');
	slot.innerHTML = '';
	}


  	
	let countdownHandle: number | null = null;
	let time = Number(import.meta.env.VITE_TOURNAMENT_LAUNCH_DELAY ?? '5');


	function startCountdown(delay: number, cb: () => void) {
		//const box   = document.getElementById('tournament-timer')!;
		//const label = document.getElementById('timer-value')!;
		const statusMessage = document.getElementById('status-message');

		if (countdownHandle) 
			clearInterval(countdownHandle);
		//box.classList.remove('hidden');
		let seconds = delay > 0 ? delay : 5;
		if (statusMessage) {
			statusMessage.textContent = i18n.t('tournament.startsIn') + seconds;
		}

		countdownHandle = window.setInterval(() => {
			seconds--;
			if (seconds > 0 && statusMessage) {
				statusMessage.textContent = i18n.t('tournament.startsIn') + seconds;
			} else {
				clearInterval(countdownHandle!);
				countdownHandle = null;
				cb();
			}
		}, 1000);
	}

	function cancelCountdown() {
		if (countdownHandle) 
			clearInterval(countdownHandle);
		countdownHandle = null;
		document.getElementById('tournament-timer')?.classList.add('hidden');
	}

	const ws = getMatchmakingSocket();
	if (!ws || ws.readyState !== WebSocket.OPEN) {
		console.error(i18n.t('gameMode.socketNotConnected'));
		return;
	}
	ws.removeEventListener('message', handleMessageTournament);
	
	function cleanupMatchmaking() {
		if (ws && ws.readyState === WebSocket.OPEN) {
			console.log(i18n.t('tournament.cleanupMatchmaking'));
			ws.removeEventListener('message', handleMessageTournament);
			cancelCountdown();
		}
	}
	// function updatePlayerStateUI(state: string) {
	// 	const app = document.getElementById('app');
	// 	if (!app) return;
	
	// 	switch (state) {
	// 		case 'eliminated':
	// 			app.innerHTML = `
	// 				<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
	// 					<h2 class="text-2xl font-bold mb-4">Dommage, vous êtes éliminé !</h2>
	// 					<p class="text-gray-600">Vous pourrez retenter votre chance la prochaine fois.</p>
	// 					<button id="backToMenuBtn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Revenir au Menu</button>
	// 				</div>
	// 			`;
	// 		break;
		
	// 		case 'waiting_next_round':
	// 			app.innerHTML = `
	// 				<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
	// 					<h2 class="text-2xl font-bold mb-4">Félicitations, vous avez gagné ce match !</h2>
	// 					<p class="text-gray-600">En attente du prochain tour...</p>
	// 				</div>
	// 			`;
	// 		break;

	// 		case 'waiting_final_prep':
	// 			app.innerHTML = `
	// 				<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
	// 					<h2 class="text-2xl font-bold mb-4">Félicitations, vous avez gagné ce match !</h2>
	// 					<p class="text-gray-600">La finale est en preparation...</p>
	// 				</div>
	// 			`;
	// 		break;
		
	// 		case 'winner':
	// 			app.innerHTML = `
	// 				<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
	// 					<h2 class="text-2xl font-bold mb-4">Bravo, vous avez gagné le tournoi !</h2>
	// 					<p class="text-gray-600">Vous êtes le champion. Félicitations&nbsp;!</p>
	// 					<button id="backToMenuBtn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Revenir au Menu</button>
	// 				</div>
	// 			`;
	// 		break;
		
	// 		default:
	// 			app.innerHTML = `
	// 				<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
	// 					<h2 class="text-2xl font-bold mb-4">Votre état joueur : ${state}</h2>
	// 					<p class="text-gray-600">En attente d'informations supplémentaires.</p>
	// 				</div>
	// 			`;
	// 	}
	// 	const backToMenuBtn = document.getElementById('backToMenuBtn');
	// 	backToMenuBtn?.addEventListener('click', () => {
	// 		history.pushState(null, '', '/menu');
	// 		window.dispatchEvent(new PopStateEvent('popstate'));
	// 	});
  	// }
	addPlayerToSlot({
		userId: currentPlayerId,
		userName: userProfile.userName ?? i18n.t('queue.you'),
		avatarUrl: currentPlayerAvatar
	});
	async function handleMessageTournament(event: MessageEvent) {
		try {
			const msg = JSON.parse(event.data);
			console.log(`${i18n.t('queue.messageReceived')}:`, msg);

			switch (msg.type) {
				case 'QUEUE_TOURNAMENT_PLAYER_JOINED':
					const list = msg.players as QueuePlayer[];
					list.forEach(p => addPlayerToSlot({
					userId: p.userId,
					userName: p.userName ?? i18n.t('queue.opponent'),
					avatarUrl: getAvatarUrl(p.userId)
					}));
					break;
				case 'QUEUE_TOURNAMENT_PLAYER_LEFT':
					removePlayerFromSlot(msg.playerId as string);
					break;
				case 'MATCH_PREP':
					const gameSessionId = msg.payload.gameSessionId;
					const round = msg.payload.round;
					if (round === 2) {
						history.pushState(null, '', `/game?gameSessionId=${gameSessionId}`);
						window.dispatchEvent(new PopStateEvent('popstate'));
					} else {
					startCountdown(time, () => {
						history.pushState(null, '', `/game?gameSessionId=${gameSessionId}`);
						window.dispatchEvent(new PopStateEvent('popstate'));
					});
					}
					break;
			}		
		} catch (error) {
			console.error(`${i18n.t('queue.errorProcessingMessage')}:`, error);
		}
	}
	
		const handlePageUnload = () => {
			if (ws && ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({
						action: 'QUEUE_LEAVE_TOURNAMENT',
						payload: {playerId: currentPlayerId}
				}));
			}
			cleanupMatchmaking();
		}
	
		window.addEventListener('beforeunload', handlePageUnload);
	
		ws.onmessage = handleMessageTournament;
		//ws.addEventListener('message', handleMessageTournament);

	
		ws.send(JSON.stringify({
			action: "QUEUE_JOIN_TOURNAMENT",
			payload: {}
		}));
	
		const backBtn = document.getElementById('backBtn');
		backBtn?.addEventListener('click', () => {
			if (ws && ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({
						action: 'QUEUE_LEAVE_TOURNAMENT',
						payload: {playerId: currentPlayerId}
				}));
			}
			cleanupMatchmaking();
			history.pushState(null, '', '/mode');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
}