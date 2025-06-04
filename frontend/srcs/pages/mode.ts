// src/pages/Home.ts

import { getMatchmakingSocket } from "../wsClient";
import i18n from '../i18n';

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
			throw new Error(`${i18n.t('profile.errorFetchingProfile')}: ${response.statusText}`);
		}
		const data = await response.json();
		console.log(`${i18n.t('profile.userProfile')}:`, data);
		return data;
	} catch (error) {
		console.error(`${i18n.t('profile.profileFetchError')}:`, error);
		return null;
	}
}

export default function mode() {
	const app = document.getElementById('app');
	if (app) {
		app.innerHTML = /*html*/`
		<div class="text-black font-jaro text-9xl mt-16 mb-36 select-none">${i18n.t('general.pongGame')}</div>
		<div class="flex justify-center items-center gap-9">
			<div id="localBtn"class='button h-36 w-80 bg-red-600 rounded-lg cursor-pointer select-none
			hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#A31F1F,0_0px_0_0_#A31F1F41]
			hover:border-b-[0px]
			transition-all duration-150 [box-shadow:0_10px_0_0_#A31F1F,0_15px_0_0_#A31F1F41]
			border-b-[1px] border-red-400'>
				<span class='flex flex-col justify-center items-center h-full text-white font-jaro text-5xl '>${i18n.t('gameMode.1v1Local')}</span>
			</div>
			<div id="onlineBtn"class='button h-36 w-80 bg-red-600 rounded-lg cursor-pointer select-none
			hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#A31F1F,0_0px_0_0_#A31F1F41]
			hover:border-b-[0px]
			transition-all duration-150 [box-shadow:0_10px_0_0_#A31F1F,0_15px_0_0_#A31F1F41]
			border-b-[1px] border-red-400'>
				<span class='flex flex-col justify-center items-center h-full text-white font-jaro text-5xl '>${i18n.t('gameMode.1v1Online')}</span>
			</div>
		</div>
		<div class="flex flex-col justify-center items-center">
			<div id="tournamentBtn" class='button mt-6 h-36 w-170 bg-blue-700 rounded-lg cursor-pointer select-none
			hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
			hover:border-b-[0px]
			transition-all duration-150 [box-shadow:0_10px_0_0_#193cb8,0_15px_0_0_#1b70f841]
			border-b-[1px] border-blue-400'>
				<span class='flex flex-col justify-center items-center h-full text-white font-jaro text-5xl'>${i18n.t('gameMode.tournament')}</span>
			</div>

			<div id="backBtn" class='button w-24 h-13 mt-10 bg-gray-700 rounded-full cursor-pointer select-none
			hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#000000,0_0px_0_0_#00000041]
			hover:border-b-[0px]
			transition-all duration-150 [box-shadow:0_10px_0_0_#000000,0_15px_0_0_#00000041]
			border-b-[1px] border-gray-400'>
				<span class='flex flex-col justify-center items-center h-full text-white font-jaro'>${i18n.t('general.back')}</span>
			</div>
		</div>
		`;

		const playLocalButton = document.getElementById('localBtn') as HTMLButtonElement; // Changed to HTMLButtonElement
        playLocalButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log(i18n.t('gameMode.localButtonClicked'));
			console.log(i18n.t('gameMode.beforeHistoryPushState'));
            history.pushState(null, '', '/local');
            window.dispatchEvent(new PopStateEvent('popstate'));
        });
		

	const playOnlineButton = document.getElementById('onlineBtn') as HTMLFormElement;
	playOnlineButton.addEventListener('click', async(e) => {
		e.preventDefault();
        console.log(i18n.t('gameMode.onlineButtonClicked'));
		const userProfile = await fetchUserProfile();
		console.log(userProfile);
		if (!userProfile) {
			console.error(i18n.t('profile.noUserConnected'));
			return;
		}

		const currentPlayerId = userProfile.userId;
		console.log(`${i18n.t('profile.currentPlayerId')}:`, currentPlayerId);

		const socket = getMatchmakingSocket();
		if (!socket || socket.readyState !== WebSocket.OPEN){
			console.error(i18n.t('gameMode.socketNotConnected'));
			return;
		}
		history.pushState(null, '', '/queue');
		window.dispatchEvent(new PopStateEvent('popstate'));
	});


	const playTournamentButton = document.getElementById('tournamentBtn') as HTMLFormElement;
	playTournamentButton.addEventListener('click', async(e) => {
		e.preventDefault();
        console.log(i18n.t('gameMode.tournamentButtonClicked'));
		const userProfile = await fetchUserProfile();
		console.log(userProfile);
		if (!userProfile) {
			console.error(i18n.t('profile.noUserConnected'));
			return;
		}

		const currentPlayerId = userProfile.userId;
		console.log(`${i18n.t('profile.currentPlayerId')}:`, currentPlayerId);
		const socket = getMatchmakingSocket();
		if (!socket || socket.readyState !== WebSocket.OPEN){
			console.error(i18n.t('gameMode.socketNotConnected'));
			return;
		}
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