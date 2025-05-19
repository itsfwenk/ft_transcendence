import { fetchUserProfile } from "./mode";
//import { fetchUserAvatar } from "./queue";

import { getMatchmakingSocket } from "../wsClient";
import { getAvatarUrl } from "./profile";
import { updatePlayerStateUI } from "./tournament";

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

	//const currentPlayerAvatar = await fetchUserAvatar(currentPlayerId);
	const currentPlayerAvatar = getAvatarUrl(currentPlayerId);
	console.log("Avatar de l'utilisateur actuel:", currentPlayerAvatar);
  
	app.innerHTML = /*html*/ `
	<div class="text-black font-jaro text-9xl mt-10 select-none">Tournament Queue</div>
  
	<!-- Grille des avatars -->
	<div id="queue-list" class="flex gap-3 flex-wrap justify-center">
	  ${renderPlayerBox(currentPlayerId,
						userProfile.userName ?? 'You',
						currentPlayerAvatar)}
	</div>

	<!-- Minuteur de démarrage (🌑 caché par défaut) -->
	<div id="tournament-timer"
		class="hidden col-span-full mt-6 px-8 py-4 rounded-md
				bg-violet-700 text-white flex-col items-center
				transition-all duration-300">
		<span class="text-3xl font-semibold">Tournament</span>
		<span id="timer-value" class="mt-2 text-lg">
		start in 5
		</span>
	</div>

	<p class="text-gray-700 mb-12">Recherche des adversaires…</p>
  
	<button id="backBtn"
			class="px-6 py-2 rounded bg-gray-700 text-white hover:bg-gray-600">
	  Back
	</button>
  `;
  	
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

	function renderPlayerBox(playerId: string, playerName: string, avatarUrl: string) {
		console.log("Rendu du joueur:", playerName, "avec l'avatar:", avatarUrl);

		const boxId = `player-${playerId.slice(0, 8)}`;
		// const playerInitial = playerName.charAt(0).toUpperCase();

		if (avatarUrl) {
			console.log("Test de l'URL de l'avatar:", avatarUrl);
			
			return `
			<div id="${boxId}" class="w-16 h-16 bg-blue-600 text-white flex items-center justify-center text-2xl rounded-md cube-3d">
				<img 
				src="${avatarUrl}" 
				alt="${playerName}" 
				class="w-full h-full object-cover"
				onload="console.log('Image chargée avec succès:', '${avatarUrl}')"
				onerror="console.log('Erreur de chargement image:', '${avatarUrl}'); this.onerror=null; this.src='/avatars/default.png';"
				/>
			</div>
			`;
		} else {
			return `
			<div class="w-16 h-16 bg-blue-600 rounded-md cube-3d flex items-center justify-center text-white text-2xl">
				<img 
				src="/avatars/default.png" 
				alt="${playerName}" 
				class="w-full h-full object-cover"
				/>
			</div>
			`;
		}
	}

		function addPlayerBox(playerId: string, playerName: string, avatarUrl: string) {
			const grid  = document.getElementById('queue-list')!;
			const boxId = `player-${playerId.slice(0, 8)}`;

			// évite les doublons
			if (document.getElementById(boxId)) return;

			grid.insertAdjacentHTML(
				'beforeend',
				renderPlayerBox(playerId, playerName, avatarUrl)
			);
		}
	  
	function removePlayerBox(id: string) {
		document.getElementById(`player-${id.slice(0, 8)}`)?.remove();
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
	async function handleMessage(event: MessageEvent) {
		try {
			const msg = JSON.parse(event.data);
			console.log("Message reçu:", msg);

			switch (msg.type) {
				case 'QUEUE_TOURNAMENT_PLAYER_JOINED':
					const list: {userId: string; userName: string}[] = msg.players;
					for (const p of list) {
					  if (p.userId === currentPlayerId) continue;
					  //const url = await fetchUserAvatar(p.userId);
					  const url = getAvatarUrl(p.userId);
					  addPlayerBox(p.userId, p.userName ?? 'Opponent', url);
					}
					break;
				case 'QUEUE_TOURNAMENT_PLAYER_LEFT':
					removePlayerBox(msg.playerId);
					break;
				case 'TOURNAMENT_LAUNCH':
					//cleanupMatchmaking();
					//const tournament_Id = msg.payload.tournament.id;
					// console.log("tournament_id", tournament_Id);
					// history.pushState(null, '', `/tournament?tournament_Id=${tournament_Id}`);
					// window.dispatchEvent(new PopStateEvent('popstate'));

					// startcountcdown, tournament start in 5, 
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
      			// 	history.pushState(null, '', `/game?gameSessionId=${msg.gameSessionId}`);
      			// 	window.dispatchEvent(new PopStateEvent('popstate'));
				// 	break;
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
