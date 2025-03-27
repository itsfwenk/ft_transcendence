import { fetchUserProfile } from "./menu";

export default async function Queuetournament() {
	const app = document.getElementById('app');
	if (!app) return;
  
	app.innerHTML = `
	  <div class="flex flex-col items-center justify-center min-h-screen">
		<h1 class="text-3xl font-bold mb-4">Lobby Matchmaking</h1>
		<p class="text-gray-700">Recherche des adversaires pour le tournoi...</p>
	  </div>
	`;
  
	// Appel à la fonction qui rejoint la queue 1v1
	// Supposons que joinQueue1v1 prenne l'id du joueur courant, par exemple récupéré via un token ou stocké globalement
	 
	const userProfile = await fetchUserProfile();
	console.log(userProfile);
	if (!userProfile) {
		console.error("Aucun utilisateur connecté");
		return;
	}
	const currentPlayerId = userProfile.userId;
	console.log("currentPlayerId:", currentPlayerId);
	const ws = new WebSocket(`ws://localhost:4000/api-matchmaking/ws?playerId=${currentPlayerId}`);
	ws.onopen = () => {
		console.log('Connexion WebSocket établie');
	};

	ws.onmessage = (event) => {
		try{
			const data = JSON.parse(event.data);
			console.log('Notification WebSocket reçue:', data);
			if (data.tournament) {
				history.pushState(null, '', `/tournament?tournamentId=${data.tournament.id}`);
				window.dispatchEvent(new PopStateEvent('popstate'));
			}
		} catch (error) {
			console.error('Erreur lors du parsing du message:', error);
		}
	};
	
	ws.onerror = (error) => {
		console.error('Erreur WebSocket:', error);
	};
	
	ws.onclose = () => {
		console.log('Connexion WebSocket fermée');
	};
}
