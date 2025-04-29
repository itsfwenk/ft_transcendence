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

	const ws = getMatchmakingSocket();
		if (!ws || ws.readyState !== WebSocket.OPEN) {
			console.error("Pas de connexion WebSocket disponible");
			return;
		}
	
		function cleanupMatchmaking() {
			if (ws && ws.readyState === WebSocket.OPEN) {
				console.log("Envoi du message de départ de la file d'attente");
				ws.send(JSON.stringify({
					action: 'leave_tournament_queue',
					payload: {playerId: currentPlayerId}
				}));
				ws.removeEventListener('message', handleMessage);
			}
		}
}
