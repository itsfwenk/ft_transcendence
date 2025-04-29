import { getMatchmakingSocket, getUserSocket } from "../wsClient";

export default function menu() {
	const app = document.getElementById('app');
	if (app) {
	  app.innerHTML = /*html*/`
	  <div class="text-black font-jaro text-9xl mt-16 mb-36">Pong Game</div>
	  <div class="flex flex-col justify-center items-center gap-6">
		<div id="PlayBtn" class='button mb-2 text-6xl h-36 w-1/2 bg-red-600 rounded-lg cursor-pointer select-none
		hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
		hover:border-b-[0px]
		transition-all duration-150 [box-shadow:0_10px_0_0_#c7181f,0_15px_0_0_#1b70f841]
		border-b-[1px] border-red-400'>
			<span class='flex flex-col justify-center items-center h-full text-white font-jaro text-6xl '>Play Game</span>
		</div>
		<!-- <button id="PlayBtn" type="button" class="mb-2 text-6xl h-36 font-jaro w-1/2 border-black rounded-md text-white bg-red-600  hover:bg-red-700 hover:outline-none focus:outline-none">Play Game</button> -->

		<div id="profileBtn" class='button text-6xl h-36 w-1/2 bg-blue-700 rounded-lg cursor-pointer select-none
		hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
		hover:border-b-[0px]
		transition-all duration-150 [box-shadow:0_10px_0_0_#193cb8,0_15px_0_0_#1b70f841]
		border-b-[1px] border-blue-400'>
			<span class='flex flex-col justify-center items-center h-full text-white font-jaro text-6xl '>Profile</span>
		</div>
		<!-- <button id="profileBtn" type="button" class="text-6xl h-36 font-jaro w-1/2 border border-black rounded-md text-white  bg-blue-700 hover:bg-blue-800  hover:outline-none focus:outline-none">Profile</button> -->
		
		<div id="disconnectBtn" class='button w-1/8 h-12 mt-5 bg-gray-700 rounded-full cursor-pointer select-none
		hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
		hover:border-b-[0px]
		transition-all duration-150 [box-shadow:0_10px_0_0_#181818,0_15px_0_0_#1b70f841]
		border-b-[1px] border-gray-400'>
		<span class='flex flex-col justify-center items-center h-full text-white font-jaro'>disconnect</span>
		</div>
	  </div>
		<!-- <button id="disconnectBtn" type="button" class="font-jaro w-1/8 h-12 mt-5 border border-black rounded-md font-medium text-white bg-black hover:bg-gray-900 focus:outline-none">disconnect</button> -->
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
      
      const disconnectBtn = document.getElementById('disconnectBtn');
      disconnectBtn?.addEventListener('click', async () => {
        try {
			const baseUrl = window.location.origin;
			const response = await fetch(`${baseUrl}/user/logout`, {
				method: 'POST'
			});
            if (!response.ok) {
				console.error('Erreur lors de la déconnexion:', response.statusText);
            } else {
				console.log('Statut utilisateur mis à offline');
            }
			const matchmakingsocket = getMatchmakingSocket();
			console.log("websocket matchmaking", matchmakingsocket);
			if (matchmakingsocket && matchmakingsocket.readyState === WebSocket.OPEN) {
				console.log("Fermeture de la WebSocket matchmaking...");
				matchmakingsocket.close();
			}
			const usersocket = getUserSocket();
			if (usersocket && usersocket.readyState === WebSocket.OPEN) {
				console.log("Fermeture de la WebSocket user...");
				usersocket.close();
			}
			history.pushState(null, '', '/');
			window.dispatchEvent(new PopStateEvent('popstate'));
        } catch (error) {
			console.error('Erreur lors de la déconnexion:', error);
			history.pushState(null, '', '/');
			window.dispatchEvent(new PopStateEvent('popstate'));
        }
      });
      };
}