import { getMatchmakingSocket } from "../wsClient";
import { fetchUserProfile } from "./mode";
import { getAvatarUrl } from "./profile";

export async function fetchUserAvatar(userId: string): Promise<string> {
  try {
    const response = await fetch(`/user/avatar/${userId}`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.warn(`Erreur lors de la récupération de l'avatar (${response.status}): ${response.statusText}`);
      return "";
    }
    
    const data = await response.json();
    console.log("Données d'avatar reçues:", data);
    
    if (data.avatarUrl) {
      console.log("URL d'avatar trouvée:", data.avatarUrl);
      return data.avatarUrl;
    } else {
      console.warn("Aucune URL d'avatar trouvée dans la réponse");
      return "";
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'avatar:", error);
    return "";
  }
}

export default async function Queue() {
	const app = document.getElementById('app');
	if (!app) return;
  
	const userProfile = await fetchUserProfile();
	if (!userProfile) {
		console.error("Aucun utilisateur connecté");
		return;
	}
  
	const currentPlayerId = userProfile.userId;
	console.log("currentPlayerId:", currentPlayerId);

	//const currentPlayerAvatar = await fetchUserAvatar(currentPlayerId);
	const currentPlayerAvatar = getAvatarUrl(currentPlayerId);
	console.log("Avatar de l'utilisateur actuel:", currentPlayerAvatar);
  
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
  
	app.innerHTML = /*html*/`
		<div class="text-black font-jaro text-9xl mt-16 mb-36 select-none">Pong Game</div>
		<div class="flex flex-col items-center justify-center">
			<div class="flex flex-col items-center justify-center w-1/3 bg-blue-700 rounded-md">
			<h1 class="text-6xl mb-9 pt-2 font-jaro">1v1 online</h1>
			<div class="flex items-center justify-center gap-3">
				<div id="player1-container">
				${renderPlayerBox(currentPlayerId ,userProfile.userName || "You", currentPlayerAvatar)}
				</div>
				<div id="player2-container">
				<div class="w-16 h-16 bg-white rounded-md cube-3d"></div>
				</div>
			</div>
			<p class="text-white font-inria font-bold pt-5 m-5">search players ...</p>
			</div>
			<div id="backBtn" class='button w-24 h-13 mt-10 bg-gray-700 rounded-full cursor-pointer select-none
			hover:translate-y-2 hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
			hover:border-b-[0px]
			transition-all duration-150 [box-shadow:0_10px_0_0_#181818,0_15px_0_0_#1b70f841]
			border-b-[1px] border-gray-400'>
			<span class='flex flex-col justify-center items-center h-full text-white font-jaro'>Back</span>
			</div>
		</div>
	`;

	const ws = getMatchmakingSocket();
	if (!ws || ws.readyState !== WebSocket.OPEN) {
		console.error("Pas de connexion WebSocket disponible");
		return;
	}

	function cleanupMatchmaking() {
		if (ws && ws.readyState === WebSocket.OPEN) {
			console.log("Envoi du message de départ de la file d'attente");
			ws.send(JSON.stringify({
				action: 'QUEUE_LEAVE_1V1',
				payload: {playerId: currentPlayerId}
			}));
			ws.removeEventListener('message', handleMessage);
		}
	}

	function addPlayerBox(id: string, name: string, url: string) {
		const grid  = document.getElementById('queue-list')!;
		const boxId = `player-${id.slice(0, 8)}`;
		if (document.getElementById(boxId)) return;          // déjà présent
	  
		grid.insertAdjacentHTML('beforeend', renderPlayerBox(id, name, url));
	}
	  
	function removePlayerBox(id: string) {
		document.getElementById(`player-${id.slice(0, 8)}`)?.remove();
	}

	async function handleMessage(event: MessageEvent) {
		try {
			const msg = JSON.parse(event.data);
			console.log("Message reçu:", msg);

			switch (msg.type) {
				case 'QUEUE_1V1_PLAYER_JOINED':
					const { userId, userName } = msg.player;
					if (userId === currentPlayerId) break;
					//const url = await fetchUserAvatar(userId);
					const url = getAvatarUrl(userId);
					addPlayerBox(userId, userName ?? 'Opponent', url);
					break;
				case 'QUEUE_1V1_PLAYER_LEFT':
					removePlayerBox(msg.playerId);
					break;
				case 'MATCH_START':
					cleanupMatchmaking();
      				history.pushState(null, '', `/game?gameSessionId=${msg.gameSessionId}`);
      				window.dispatchEvent(new PopStateEvent('popstate'));
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
		action: "QUEUE_JOIN_1V1",
		payload: {}
	}));

	const backBtn = document.getElementById('backBtn');
	backBtn?.addEventListener('click', () => {
		cleanupMatchmaking();
		history.pushState(null, '', '/mode');
		window.dispatchEvent(new PopStateEvent('popstate'));
	});
}
