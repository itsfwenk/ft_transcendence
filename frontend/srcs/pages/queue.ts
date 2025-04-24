import { fetchUserProfile } from "./mode";

export default async function Queue() {
	const app = document.getElementById('app');
	if (!app) return;
  
	app.innerHTML = /*html*/`
	<div class="text-black font-jaro text-9xl mt-16 mb-36">Pong Game</div>
	<div class="flex items-center justify-center">
		<div class="flex flex-col items-center justify-center w-1/2 bg-blue-700 ronded-mg">
			<h1 class="text-6xl mb-9 pt-2 font-jaro">Tournament</h1>
			<div class="flex items-center justify-center gap-3">
				<div class="w-15 h-15 bg-white ronded-mg"></div>
				<div class="w-15 h-15 bg-white ronded-mg"></div>
				<div class="w-15 h-15 bg-white ronded-mg"></div>
				<div class="w-15 h-15 bg-white ronded-mg"></div>
			</div>
			<p class="text-white font-inria pt-5 m-5">search players ...</p>
		</div>
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
	// const playButton = document.getElementById('onlineBtn') as HTMLFormElement;
	// playButton.addEventListener('click', async(e) => {
	// 	e.preventDefault();
    //     console.log("online button...");
	
	// 	const currentPlayerId = localStorage.getItem('userId');
	// 	console.log(currentPlayerId);
	// 	if (currentPlayerId) {
	// 		e.preventDefault();
	// 		console.log("online button...");
	// 		try {
	// 			const response = await fetch('http://localhost:4000/api-game/start', {
	// 			method: 'POST',
	// 			});
		
	// 			if (!response.ok) {
	// 			throw new Error(`Erreur lors du lancement de la page: ${response.statusText}`);
	// 			}
		
	// 			const data = await response.json();
	// 			console.log("Réponse de login:", data);
	// 			history.pushState(null, '', '/game');
	// 			window.dispatchEvent(new PopStateEvent('popstate'));
	// 		} catch (error) {
	// 			console.error("Erreur de login:", error);
	// 		}
	// 	} else {
	// 	console.error("Aucun utilisateur connecté.");
	// 	}
	// })