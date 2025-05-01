import { fetchUserProfile } from "./mode";
import { fetchUserAvatar } from "./queue";
import { getMatchmakingSocket } from "../wsClient";

export default async function Queuetournament() {
	const app = document.getElementById('app');
	if (!app) return;
  
	app.innerHTML = /*html*/`
	  <div class="flex flex-col items-center justify-center min-h-screen">
		<h1 class="text-3xl font-bold mb-4">Lobby Matchmaking</h1>
		<p class="text-gray-700">Recherche des adversaires pour le tournoi...</p>
	  </div>
	`;
  	 
	const userProfile = await fetchUserProfile();
	console.log(userProfile);
	if (!userProfile) {
		console.error("Aucun utilisateur connecté");
		return;
	}
	const currentPlayerId = userProfile.userId;
	console.log("currentPlayerId:", currentPlayerId);

	const currentPlayerAvatar = await fetchUserAvatar(currentPlayerId);
	console.log("Avatar de l'utilisateur actuel:", currentPlayerAvatar);

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
				const data = JSON.parse(event.data);
				console.log("Message reçu:", data);
				
				if (data.type === 'QUEUE_TOURNAMENT_PLAYER_JOINED' && data.player && data.player.userId) {
					const playerId = data.player.userId;
					if (playerId !== currentPlayerId) {
						const playerAvatar = await fetchUserAvatar(playerId);
						const playerName = data.player.userName || "Opponent";
						console.log("Avatar du joueur rejoint:", playerAvatar);
						
						const player2Container = document.getElementById('player2-container');
						if (player2Container) {
							player2Container.innerHTML = renderPlayerBox(playerId ,playerName, playerAvatar);
						}
					}
				}
				if (data.type === 'launch_1v1' && data.gameSessionId) {
					cleanupMatchmaking();
					history.pushState(null, '', `/game?gameSessionId=${data.gameSessionId}`);
					window.dispatchEvent(new PopStateEvent('popstate'));
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
