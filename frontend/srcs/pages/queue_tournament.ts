import { fetchUserProfile } from "./mode";
import { getMatchmakingSocket } from "../wsClient";
import { getAvatarUrl } from "./profile";

export default async function Queuetournament() {
	const app = document.getElementById('app');
	if (!app) return;
  
	const userProfile = await fetchUserProfile();
	console.log(userProfile);
	if (!userProfile) {
		console.error("Aucun utilisateur connecté");
		return;
	}
	const currentPlayerId = userProfile.userId;
	console.log("currentPlayerId:", currentPlayerId);

	const currentPlayerAvatar = getAvatarUrl(currentPlayerId);
	console.log("Avatar de l'utilisateur actuel:", currentPlayerAvatar);
  
	app.innerHTML = /*html*/ `
	<div class="text-black font-jaro text-9xl mt-16 mb-36 select-none">Pong Game</div>
    <div class="flex flex-col items-center justify-center">
      <div class="flex flex-col items-center justify-center w-1/3 bg-blue-700 rounded-md">
      <h1 class="text-6xl mb-9 pt-2 font-jaro">Tournament</h1>
      <div id="queue-list" class="flex flex-wrap justify-center gap-3">
	  
	  
      </div>
      <p id="status-message" class="text-white font-inria font-bold pt-5 m-5">searching for opponents...</p>
      </div>
      <div id="backBtn" class='button w-24 h-13 mt-10 bg-gray-700 rounded-full cursor-pointer select-none
      hover:translate-y-2 hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
      hover:border-b-[0px]
      transition-all duration-150 [box-shadow:0_10px_0_0_#181818,0_15px_0_0_#1b70f841]
      border-b-[1px] border-gray-400'>
      <span class='flex flex-col justify-center items-center h-full text-white font-jaro'>Back</span>
      </div>
    </div>

	<div id="tournament-timer"
		class="hidden col-span-full mt-6 px-8 py-4 rounded-md
				bg-violet-700 text-white flex-col items-center
				transition-all duration-300">
		<span class="text-3xl font-semibold">Tournament</span>
		<span id="timer-value" class="mt-2 text-lg">
		start in 5
		</span>
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
		const box   = document.getElementById('tournament-timer')!;
		const label = document.getElementById('timer-value')!;

		if (countdownHandle) 
			clearInterval(countdownHandle);
		box.classList.remove('hidden');
		let seconds = delay > 0 ? delay : 5;
		label.textContent = `start in ${seconds}`;

		countdownHandle = window.setInterval(() => {
			seconds--;
			if (seconds > 0) {
			label.textContent = `start in ${seconds}`;
			} else {
			clearInterval(countdownHandle!);
			countdownHandle = null;
			label.textContent = 'Starting…';
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
		console.error("Pas de connexion WebSocket disponible");
		return;
	}
	
	function cleanupMatchmaking() {
		if (ws && ws.readyState === WebSocket.OPEN) {
			console.log("Envoi du message de départ de la file d'attente");
			ws.send(JSON.stringify({
				action: 'QUEUE_LEAVE_TOURNAMENT',
				payload: {playerId: currentPlayerId}
			}));
			ws.removeEventListener('message', handleMessage);
			cancelCountdown();
		}
	}
	function updatePlayerStateUI(state: string) {
		const app = document.getElementById('app');
		if (!app) return;
	
		switch (state) {
			case 'eliminated':
				app.innerHTML = `
					<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
						<h2 class="text-2xl font-bold mb-4">Dommage, vous êtes éliminé !</h2>
						<p class="text-gray-600">Vous pourrez retenter votre chance la prochaine fois.</p>
						<button id="backToMenuBtn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Revenir au Menu</button>
					</div>
				`;
			break;
		
			case 'waiting_next_round':
				app.innerHTML = `
					<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
						<h2 class="text-2xl font-bold mb-4">Félicitations, vous avez gagné ce match !</h2>
						<p class="text-gray-600">En attente du prochain tour...</p>
					</div>
				`;
			break;

			case 'waiting_final_prep':
				app.innerHTML = `
					<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
						<h2 class="text-2xl font-bold mb-4">Félicitations, vous avez gagné ce match !</h2>
						<p class="text-gray-600">La finale est en preparation...</p>
					</div>
				`;
			break;
		
			case 'winner':
				app.innerHTML = `
					<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
						<h2 class="text-2xl font-bold mb-4">Bravo, vous avez gagné le tournoi !</h2>
						<p class="text-gray-600">Vous êtes le champion. Félicitations&nbsp;!</p>
						<button id="backToMenuBtn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Revenir au Menu</button>
					</div>
				`;
			break;
		
			default:
				app.innerHTML = `
					<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
						<h2 class="text-2xl font-bold mb-4">Votre état joueur : ${state}</h2>
						<p class="text-gray-600">En attente d'informations supplémentaires.</p>
					</div>
				`;
		}
		const backToMenuBtn = document.getElementById('backToMenuBtn');
		backToMenuBtn?.addEventListener('click', () => {
			history.pushState(null, '', '/menu');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
  	}
	addPlayerToSlot({
		userId: currentPlayerId,
		userName: userProfile.userName ?? 'You',
		avatarUrl: currentPlayerAvatar
	});
	async function handleMessage(event: MessageEvent) {
		try {
			const msg = JSON.parse(event.data);
			console.log("Message reçu:", msg);

			switch (msg.type) {
				case 'QUEUE_TOURNAMENT_PLAYER_JOINED':
					const list = msg.players as QueuePlayer[];      // tableau envoyé par le serveur
					list.forEach(p => addPlayerToSlot({
					userId: p.userId,
					userName: p.userName ?? 'Opponent',
					avatarUrl: getAvatarUrl(p.userId)
					}));
					break;
				case 'QUEUE_TOURNAMENT_PLAYER_LEFT':
					removePlayerFromSlot(msg.playerId as string);
					break;


				case 'MATCH_PREP':
					console.log("msg MATch_prep", msg);
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
				case 'PLAYER_STATE_UPDATE':
					updatePlayerStateUI(msg.payload.state);
					break;
			}		
		} catch (error) {
			console.error("Erreur lors du traitement du message:", error);
		}
	}
	
		const handlePageUnload = () => {
			cleanupMatchmaking();
		}
	
		window.addEventListener('beforeunload', handlePageUnload);
	
		ws.addEventListener('message', handleMessage);
	
		ws.send(JSON.stringify({
			action: "QUEUE_JOIN_TOURNAMENT",
			payload: {}
		}));
	
		const backBtn = document.getElementById('backBtn');
		backBtn?.addEventListener('click', () => {
			cleanupMatchmaking();
			history.pushState(null, '', '/mode');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
}
