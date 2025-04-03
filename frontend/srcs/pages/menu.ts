// src/pages/Home.ts

import { getMatchmakingSocket, matchmakingWebSocket } from "../wsClient";

export async function fetchUserProfile() {
	try {
	  const response = await fetch('http://localhost:4000/api-user/getProfile', {
		method: 'GET',
		credentials: 'include',
		headers: {
		  'Content-Type': 'application/json'
		}
	  });
	  if (!response.ok) {
		throw new Error(`Erreur lors de la récupération du profil: ${response.statusText}`);
	  }
	  const data = await response.json();
	  console.log("Profil utilisateur:", data);
	  return data;
	} catch (error) {
	  console.error("Erreur de récupération du profil:", error);
	  return null;
	}
}

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

			const response = await fetch('http://localhost:4000/api-game/start', {
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
		const userProfile = await fetchUserProfile();
		console.log(userProfile);
		if (!userProfile) {
			console.error("Aucun utilisateur connecté");
			return;
		}

		const currentPlayerId = userProfile.userId;
		console.log("currentPlayerId:", currentPlayerId)

		const socket = getMatchmakingSocket();
		if (!socket || socket.readyState !== WebSocket.OPEN){
			console.error("Socket non connectée");
			return;
		}
		socket.send(JSON.stringify({
			action: "join_1v1",
			payload: {}
		}));
		history.pushState(null, '', '/queue');
		window.dispatchEvent(new PopStateEvent('popstate'));
	});


	const playTournamentButton = document.getElementById('tournamentBtn') as HTMLFormElement;
	playTournamentButton.addEventListener('click', async(e) => {
		e.preventDefault();
        console.log("tournament button...");
		const userProfile = await fetchUserProfile();
		console.log(userProfile);
		if (!userProfile) {
			console.error("Aucun utilisateur connecté");
			return;
		}

		const currentPlayerId = userProfile.userId;
		console.log("currentPlayerId:", currentPlayerId)
		const socket = getMatchmakingSocket();
		if (!socket || socket.readyState !== WebSocket.OPEN){
			console.error("Socket non connectée");
			return;
		}
		socket.send(JSON.stringify({
			action: "join_tournament",
			payload: {}
		}));
		history.pushState(null, '', '/queue_tournament');
		window.dispatchEvent(new PopStateEvent('popstate'));
	});


    }
}