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
		<!-- component -->


		<div class="text-black font-jaro text-9xl mt-16 mb-36 select-none">Pong Game</div>
		<div class="flex justify-center items-center gap-9">
			<div id="localBtn"class='button h-36 w-80 bg-red-600 rounded-lg cursor-pointer select-none
			hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
			hover:border-b-[0px]
			transition-all duration-150 [box-shadow:0_10px_0_0_#c7181f,0_15px_0_0_#1b70f841]
			border-b-[1px] border-red-400'>
				<span class='flex flex-col justify-center items-center h-full text-white font-jaro text-5xl '>1v1 local</span>
			</div>
			<!-- <button type="button" id="localBtn" class="text-5xl h-36 font-jaro w-80 bg-red-600  hover:bg-red-700  hover:outline-none focus:outline-none text-white px-4 py-2 rounded">1v1 local</button> -->
			<div id="onlineBtn"class='button h-36 w-80 bg-red-600 rounded-lg cursor-pointer select-none
			hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
			hover:border-b-[0px]
			transition-all duration-150 [box-shadow:0_10px_0_0_#c7181f,0_15px_0_0_#1b70f841]
			border-b-[1px] border-red-400'>
				<span class='flex flex-col justify-center items-center h-full text-white font-jaro text-5xl '>1v1 online</span>
			</div>
			<!-- <button type="button" id="onlineBtn" class="text-5xl h-36 font-jaro w-80 bg-red-600  hover:bg-red-700  hover:outline-none focus:outline-none text-white px-4 py-2 rounded">1v1 online</button> -->
		</div>
		<div class="flex flex-col justify-center items-center">
			<div id="tournamentBtn" class='button mt-6 h-36 w-170 bg-blue-700 rounded-lg cursor-pointer select-none
			hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
			hover:border-b-[0px]
			transition-all duration-150 [box-shadow:0_10px_0_0_#193cb8,0_15px_0_0_#1b70f841]
			border-b-[1px] border-blue-400'>
				<span class='flex flex-col justify-center items-center h-full text-white font-jaro text-5xl'>Tournament</span>
			</div>
			<!-- <button type="button" id="tournamentBtn" class="text-6xl h-36 font-jaro w-170 mt-6 bg-blue-700 hover:bg-blue-800 hover:outline-none focus:outline-none text-white px-4 py-2 rounded">Tournament</button> -->

			<div id="backBtn" class='button w-24 h-13 mt-10 bg-gray-700 rounded-full cursor-pointer select-none
			hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
			hover:border-b-[0px]
			transition-all duration-150 [box-shadow:0_10px_0_0_#181818,0_15px_0_0_#1b70f841]
			border-b-[1px] border-gray-400'>
				<span class='flex flex-col justify-center items-center h-full text-white font-jaro'>Back</span>
			</div>
			<!-- <button id="disconnectBtn" type="button" class="font-jaro w-24 h-13 mt-10 border border-black rounded-md font-medium text-white bg-black hover:bg-gray-900 focus:outline-none">back</button> -->
		</div>
		`;

		const playLocalButton = document.getElementById('localBtn') as HTMLButtonElement; // Changed to HTMLButtonElement
        playLocalButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("local button clicked, navigating to /local");
			console.log("before history pushState");
            history.pushState(null, '', '/local');
            window.dispatchEvent(new PopStateEvent('popstate'));
        });
		
	// 	const playLocalButton = document.getElementById('localBtn') as HTMLFormElement;
    // 	playLocalButton.addEventListener('click', async(e) => {
    //     e.preventDefault();
    //     console.log("local button...");
	// 	try {
	// 		const baseUrl = window.location.origin;
	// 		const response = await fetch(`${baseUrl}/game/start`, {
	// 		  method: 'POST',
	// 		});
	
	// 		if (!response.ok) {
	// 		  throw new Error(`Erreur lors du lancement de la page: ${response.statusText}`);
	// 		}
	
	// 		const data = await response.json();
	// 		console.log("Réponse de login:", data);
	// 		history.pushState(null, '', '/game');
	// 		window.dispatchEvent(new PopStateEvent('popstate'));
	// 	  } catch (error) {
	// 		console.error("Erreur de login:", error);
	// 	  }
	// });

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
			action: "join_queue_1v1",
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
			action: "join_queue_tournament",
			payload: {}
		}));
		history.pushState(null, '', '/queue_tournament');
		window.dispatchEvent(new PopStateEvent('popstate'));
	});

	const backBtn = document.getElementById('backBtn');
	backBtn?.addEventListener('click', () => {
		history.pushState(null, '', '/menu');
		window.dispatchEvent(new PopStateEvent('popstate'));
	});

    }
}