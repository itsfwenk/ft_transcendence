// src/pages/Home.ts
export default function menu() {
	const app = document.getElementById('app');
	if (app) {
		app.innerHTML = `
		<div class="flex flex-col items-center justify-center min-h-screen">
			<h1 class="text-3xl font-bold text-blue-600 mb-4">Bienvenue sur Pong Game</h1>
			<form id="loginForm" class="space-y-4">
			<button type="button" id="localBtn" class="bg-blue-600 text-white px-4 py-2 rounded">Play 1v1 local</button>
			<button type="button" id="onlineBtn" class="bg-blue-600 text-white px-4 py-2 rounded">Play 1v1 online</button>
			<button type="button" id="tournamentBtn" class="bg-blue-600 text-white px-4 py-2 rounded">Play tournament</button>
			</form>
			<p class="mt-4">
			Pas de compte ? <a href="/signup" data-link class="text-indigo-600 hover:underline">Inscrivez-vous</a>
			</p>
		</div>
		`;

	
		
      const playLocalButton = document.getElementById('localBtn') as HTMLFormElement;
      playLocalButton.addEventListener('click', async(e) => {
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
	});

	const playOnlineButton = document.getElementById('onlineBtn') as HTMLFormElement;
	playOnlineButton.addEventListener('click', async(e) => {
		e.preventDefault();
        console.log("online button...");
		const currentPlayerId = localStorage.getItem('userId');
		if (!currentPlayerId) {
			console.error("Aucun utilisateur connecté");
			return;
		}
		try {
			const response = await fetch('http://localhost:4000/matchmaking/join', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ playerId: Number(currentPlayerId) })
			});
	  
			if (!response.ok) {
				throw new Error(`Erreur lors du lancement de la page: ${response.statusText}`);
			}
			const data = await response.json();
			console.log("Réponse de login:", data);
			history.pushState(null, '', '/queue');
			window.dispatchEvent(new PopStateEvent('popstate'));
		} catch (error) {
			  console.error("Erreur de login:", error);
		}
	})
    }
}