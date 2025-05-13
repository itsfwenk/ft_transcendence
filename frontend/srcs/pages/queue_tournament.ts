import { fetchUserProfile } from "./mode";
//import { fetchUserAvatar } from "./queue";

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
  
	<p class="text-gray-700 mb-12">Recherche des adversaires…</p>
  
	<button id="backBtn"
			class="px-6 py-2 rounded bg-gray-700 text-white hover:bg-gray-600">
	  Back
	</button>
  `;
  	


	function renderPlayerBox(playerId: string, playerName: string, avatarUrl: string) {
		console.log("Rendu du joueur:", playerName, "avec l'avatar:", avatarUrl);

		const boxId = `player-${playerId.slice(0, 8)}`;
		const playerInitial = playerName.charAt(0).toUpperCase();

		if (avatarUrl) {
			console.log("Test de l'URL de l'avatar:", avatarUrl);
			
			return `
			<div id="${boxId}" class="w-16 h-16 bg-blue-600 text-white flex items-center justify-center text-2xl rounded-md cube-3d">
				<img 
				src="${avatarUrl}" 
				alt="${playerName}" 
				class="w-full h-full object-cover"
				onload="console.log('Image chargée avec succès:', '${avatarUrl}')"
				onerror="console.log('Erreur de chargement image:', '${avatarUrl}'); document.getElementById('${boxId}').innerHTML='${playerInitial}';"
				/>
			</div>
			`;
		} else {
			return `
			<div class="w-16 h-16 bg-blue-600 rounded-md cube-3d flex items-center justify-center text-white text-2xl">
				${playerInitial}
			</div>
			`;
		}
	}

	function addPlayerBox(id: string, name: string, url: string) {
		const grid  = document.getElementById('queue-list')!;
		const boxId = `player-${id.slice(0, 8)}`;
		if (document.getElementById(boxId)) return;
	  
		grid.insertAdjacentHTML('beforeend', renderPlayerBox(id, name, url));
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
		}
	}
	async function handleMessage(event: MessageEvent) {
		try {
			const msg = JSON.parse(event.data);
			console.log("Message reçu:", msg);

			switch (msg.type) {
				case 'QUEUE_SNAPSHOT':
					const list: {userId: string; userName: string}[] = msg.players;
					for (const p of list) {
					  if (p.userId === currentPlayerId) continue;
					  //const url = await fetchUserAvatar(p.userId);
					  const url = getAvatarUrl(p.userId);
					  addPlayerBox(p.userId, p.userName ?? 'Opponent', url);
					}
					break;
				case 'QUEUE_TOURNAMENT_PLAYER_JOINED':
					const { userId, userName } = msg.player;
					if (userId === currentPlayerId) break;
					//const url = await fetchUserAvatar(userId);
					const url = getAvatarUrl(userId);
					addPlayerBox(userId, userName ?? 'Opponent', url);
					break;
				case 'QUEUE_TOURNAMENT_PLAYER_LEFT':
					removePlayerBox(msg.playerId);
					break;
				case 'TOURNAMENT_LAUNCH':
					cleanupMatchmaking();
					const tournament = msg.payload;
					const tournament_Id = tournament.id;
					history.pushState(null, '', `/tournament?tournament_Id=${tournament_Id}`);
					window.dispatchEvent(new PopStateEvent('popstate'));
					break;

				// case 'MATCH_START':
					
      			// 	history.pushState(null, '', `/game?gameSessionId=${msg.gameSessionId}`);
      			// 	window.dispatchEvent(new PopStateEvent('popstate'));
				// 	break;
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
