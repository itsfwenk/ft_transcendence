import { getMatchmakingSocket, getUserSocket } from "../wsClient";
import i18n from '../i18n';


export default function menu() {
	const app = document.getElementById('app');
	if (app) {
	  app.innerHTML = /*html*/`
	  <div class="text-black font-jaro text-9xl mt-16 mb-36 select-none">${i18n.t('general.pongGame')}</div>
	  <div class="flex flex-col justify-center items-center gap-6">

			<div 
				id="PlayBtn" 
				class='button mb-2 text-6xl h-36 w-1/2 bg-red-600 rounded-lg cursor-pointer select-none
					hover:translate-y-2
					hover:[box-shadow:0_0px_0_0_#A31F1F,0_0px_0_0_#A31F1F41]
					hover:border-b-[0px]
					transition-all duration-150
					[box-shadow:0_10px_0_0_#A31F1F,0_15px_0_0_#A31F1F41]
					border-b-[1px] border-red-400'
			>
			<span class='flex flex-col justify-center items-center h-full text-white font-jaro text-6xl '>Play Game</span>
			</div>

			<div 
				id="profileBtn" 
				class='button text-6xl h-36 w-1/2 bg-blue-700 rounded-lg cursor-pointer select-none
					hover:translate-y-2 
					hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
					hover:border-b-[0px]
					transition-all duration-150 
					[box-shadow:0_10px_0_0_#193cb8,0_15px_0_0_#1b70f841]
					border-b-[1px] border-blue-400'
			>
			<span class='flex flex-col justify-center items-center h-full text-white font-jaro text-6xl '>Profile</span>
			</div>
			
			<div
			id="customBtn"
			class="button text-6xl h-36 w-1/2 bg-[#FFB81B] rounded-lg cursor-pointer select-none
					hover:translate-y-2
					hover:[box-shadow:0_0px_0_0_#d98a00,0_0px_0_0_#d98a0041]
					hover:border-b-[0px]
					transition-all duration-150
					[box-shadow:0_10px_0_0_#d98a00,0_15px_0_0_#d98a0041]
					border-b-[1px] border-[#D98A00]"
			>
			<span class="flex flex-col justify-center items-center h-full text-white font-jaro text-6xl">Customization</span>
			</div>

			<div 
				id="disconnectBtn" 
				class='button w-1/8 h-12 mt-5 bg-gray-700 rounded-full cursor-pointer select-none
					hover:translate-y-2  
					hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
					hover:border-b-[0px]
					transition-all duration-150 
					[box-shadow:0_10px_0_0_#181818,0_15px_0_0_#1b70f841]
					border-b-[1px] border-gray-400'
			>
			<span class='flex flex-col justify-center items-center h-full text-white font-jaro'>disconnect</span>
			</div>

	  </div>
	  `;
		
      const playBtn = document.getElementById('PlayBtn');
      playBtn?.addEventListener('click', () => {
        history.pushState(null, '', '/mode');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });

		const profileBtn = document.getElementById('profileBtn');
		profileBtn?.addEventListener('click', () => {
			history.pushState(null, '', '/profile');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
      
		const customBtn = document.getElementById('customBtn');
		customBtn?.addEventListener('click', () => {
			history.pushState(null, '', '/customGame');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});

      const disconnectBtn = document.getElementById('disconnectBtn');
      disconnectBtn?.addEventListener('click', async () => {
		console.log(i18n.t('menu.clickDisconnect'));
		handleDisconnect();
      });
      };
}

export const handleDisconnect = async () => {
	try {
		const baseUrl = window.location.origin;
		const response = await fetch(`${baseUrl}/user/logout`, {
			method: 'POST'
		});
		if (!response.ok) {
			console.error(`${i18n.t('menu.errorLogout')}: ${response.statusText}`);
		} else {
			console.log(i18n.t('menu.userStatusOffline'));
		}
		const matchmakingsocket = getMatchmakingSocket();
		console.log(i18n.t('menu.websocketMatchmaking'), matchmakingsocket);
		if (matchmakingsocket && matchmakingsocket.readyState === WebSocket.OPEN) {
			console.log(i18n.t('menu.closingMatchmakingSocket'));
			matchmakingsocket.close();
		}
		const usersocket = getUserSocket();
		if (usersocket && usersocket.readyState === WebSocket.OPEN) {
			console.log(i18n.t('menu.closingUserSocket'));
			usersocket.close();
		}
		localStorage.removeItem("userId");
		history.pushState(null, '', '/');
		window.dispatchEvent(new PopStateEvent('popstate'));
	} catch (error) {
		console.error(`${i18n.t('menu.errorLogout')}:`, error);
		history.pushState(null, '', '/');
		window.dispatchEvent(new PopStateEvent('popstate'));
	}
};