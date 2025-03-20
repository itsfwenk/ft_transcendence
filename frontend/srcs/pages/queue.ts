export default function Queue() {
	const app = document.getElementById('app');
	if (!app) return;
  
	app.innerHTML = `
	  <div class="flex flex-col items-center justify-center min-h-screen">
		<h1 class="text-3xl font-bold mb-4">Lobby Matchmaking</h1>
		<p class="text-gray-700">Recherche d'un adversaire...</p>
	  </div>
	`;
  
	// Appel à la fonction qui rejoint la queue 1v1
	// Supposons que joinQueue1v1 prenne l'id du joueur courant, par exemple récupéré via un token ou stocké globalement
	const currentPlayerId = localStorage.getItem('userId');
	if (currentPlayerId) {
	  e.preventDefault();
        console.log("local button...");
		try {

			const response = await fetch('http://localhost:4000/game/start', {
			  method: 'POST',
			});
	
			if (!response.ok) {
			  throw new Error(`Erreur lors du lancement de la page: ${response.statusText}`);
			}
	
			const data = await response.json();
			console.log("Réponse de login:", data);
			history.pushState(null, '', '/game');
			window.dispatchEvent(new PopStateEvent('popstate'));
		  } catch (error) {
			console.error("Erreur de login:", error);
		  }
	} else {
	  console.error("Aucun utilisateur connecté.");
	}
  }