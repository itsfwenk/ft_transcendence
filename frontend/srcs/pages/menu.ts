// src/pages/Home.ts

import { getMatchmakingSocket } from "../wsClient";

export async function fetchUserProfile() {
	try {
		const baseUrl = window.location.origin;
		const response = await fetch(`${baseUrl}/user/getProfile`, {
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

export default function mode() {
	const app = document.getElementById('app');
	if (app) {
	  app.innerHTML = /*html*/`
	  <div class="text-black font-jaro text-9xl mt-16 mb-36">Pong Game</div>
	  <div class="flex flex-col justify-center items-center gap-6">
		<button id="PlayBtn" type="button" class="mb-2 text-6xl h-36 font-jaro w-1/2 border-black rounded-md text-white bg-red-600  hover:bg-red-700 hover:outline-none focus:outline-none">Play Game</button>
		<button id="profileBtn" type="button" class="text-6xl h-36 font-jaro w-1/2 border border-black rounded-md text-white  bg-blue-700 hover:bg-blue-800  hover:outline-none focus:outline-none">Profile</button>
		<button id="disconnectBtn" type="button" class="font-jaro w-1/8 h-12 mt-5 border border-black rounded-md font-medium text-white bg-black hover:bg-gray-900 focus:outline-none">disconnect</button>
	  </div>
	  `;

	
		
    const playLocalButton = document.getElementById('localBtn') as HTMLFormElement;
    	playLocalButton.addEventListener('click', async(e) => {
        e.preventDefault();
        console.log("local button...");
		try {
			const baseUrl = window.location.origin;
			const response = await fetch(`${baseUrl}/game/start`, {
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