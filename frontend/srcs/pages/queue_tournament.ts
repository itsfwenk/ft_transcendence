import { fetchUserProfile } from "./mode";

export default async function Queuetournament() {
	const app = document.getElementById('app');
	if (!app) return;
  
	app.innerHTML = /*html*/`
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
}
