import { fetchUserProfile } from "./mode";
//import { fetchUserAvatar } from "./queue";

import { getMatchmakingSocket } from "../wsClient";
import { getAvatarUrl } from "./profile";
import i18n from '../i18n';

export default async function Queuetournament() {
	const app = document.getElementById('app');
	if (!app) return;
  
	const userProfile = await fetchUserProfile();
	console.log(userProfile);
	if (!userProfile) {
		console.error(i18n.t('profile.noUserConnected'));
		return;
	}
	const currentPlayerId = userProfile.userId;
	console.log(`${i18n.t('profile.currentPlayerId')}:`, currentPlayerId);

	//const currentPlayerAvatar = await fetchUserAvatar(currentPlayerId);
	const currentPlayerAvatar = getAvatarUrl(currentPlayerId);
	console.log(`${i18n.t('profile.currentPlayerAvatar')}:`, currentPlayerAvatar);
  
	app.innerHTML = /*html*/ `
	<div class="text-black font-jaro text-9xl mt-10 select-none">${i18n.t('queue.tournamentQueue')}</div>
  
	<!-- Grille des avatars -->
	<div id="queue-list" class="flex gap-3 flex-wrap justify-center">
	  ${renderPlayerBox(currentPlayerId,
						userProfile.userName ?? i18n.t('queue.you'),
						currentPlayerAvatar)}
	</div>
  
	<p class="text-gray-700 mb-12">${i18n.t('queue.searchingOpponents')}</p>
  
	<button id="backBtn"
			class="px-6 py-2 rounded bg-gray-700 text-white hover:bg-gray-600">
	  ${i18n.t('general.back')}
	</button>
  `;
  	


	function renderPlayerBox(playerId: string, playerName: string, avatarUrl: string) {
		console.log(`${i18n.t('queue.renderingPlayer')}:`, playerName, `${i18n.t('queue.withAvatar')}:`, avatarUrl);

		const boxId = `player-${playerId.slice(0, 8)}`;
		// const playerInitial = playerName.charAt(0).toUpperCase();

		if (avatarUrl) {
			console.log(`${i18n.t('queue.testingAvatarURL')}:`, avatarUrl);
			
			return `
			<div id="${boxId}" class="w-16 h-16 bg-blue-600 text-white flex items-center justify-center text-2xl rounded-md cube-3d">
				<img 
				src="${avatarUrl}" 
				alt="${playerName}" 
				class="w-full h-full object-cover"
				onload="console.log('${i18n.t('queue.imageLoadedSuccessfully')}:', '${avatarUrl}')"
				onerror="console.log('${i18n.t('queue.errorLoadingImage')}:', '${avatarUrl}'); this.onerror=null; this.src='/avatars/default.png';"
				/>
			</div>
			`;
		} else {
			return `
			<div class="w-16 h-16 bg-blue-600 rounded-md cube-3d flex items-center justify-center text-white text-2xl">
				<img 
				src="/avatars/default.png" 
				alt="${playerName}" 
				class="w-full h-full object-cover"
				/>
			</div>
			`;
		}
	}

	function addPlayerBox(id: string, name: string, url: string) {
		const grid  = document.getElementById('queue-list')!;
		const boxId = `player-${id.slice(0, 8)}`;
		if (document.getElementById(boxId)) return;
	  
		grid.insertAdjacentHTML('beforeend', renderPlayerBox(id, name, url));
	}
	  
	function removePlayerBox(id: string) {
		document.getElementById(`player-${id.slice(0, 8)}`)?.remove();
	}

	const ws = getMatchmakingSocket();
	if (!ws || ws.readyState !== WebSocket.OPEN) {
		console.error(i18n.t('gameMode.socketNotConnected'));
		return;
	}
	
	function cleanupMatchmaking() {
		if (ws && ws.readyState === WebSocket.OPEN) {
			console.log(i18n.t('queue.sendingQueueLeaveMessage'));
			ws.send(JSON.stringify({
				action: 'QUEUE_LEAVE_TOURNAMENT',
				payload: {playerId: currentPlayerId}
			}));
			ws.removeEventListener('message', handleMessage);
		}
	}
	async function handleMessage(event: MessageEvent) {
		try {
			const msg = JSON.parse(event.data);
			console.log(`${i18n.t('queue.messageReceived')}:`, msg);

			switch (msg.type) {
				case 'QUEUE_TOURNAMENT_PLAYER_JOINED':
					const list: {userId: string; userName: string}[] = msg.players;
					for (const p of list) {
					  if (p.userId === currentPlayerId) continue;
					  //const url = await fetchUserAvatar(p.userId);
					  const url = getAvatarUrl(p.userId);
					  addPlayerBox(p.userId, p.userName ?? i18n.t('queue.opponent'), url);
					}
					break;
				case 'QUEUE_TOURNAMENT_PLAYER_LEFT':
					removePlayerBox(msg.playerId);
					break;
				case 'TOURNAMENT_LAUNCH':
					cleanupMatchmaking();
					const tournament_Id = msg.payload.tournament.id;
					console.log(`${i18n.t('queue.tournamentId')}:`, tournament_Id);
					history.pushState(null, '', `/tournament?tournament_Id=${tournament_Id}`);
					window.dispatchEvent(new PopStateEvent('popstate'));
					break;

				// case 'MATCH_START':
					
      			// 	history.pushState(null, '', `/game?gameSessionId=${msg.gameSessionId}`);
      			// 	window.dispatchEvent(new PopStateEvent('popstate'));
				// 	break;
			}		
		} catch (error) {
			console.error(`${i18n.t('queue.errorProcessingMessage')}:`, error);
		}
	}
	
		const handlePageUnload = () => {
			cleanupMatchmaking();
		}
	
		window.addEventListener('beforeunload', handlePageUnload);
	
		ws.addEventListener('message', handleMessage);
	
		ws.send(JSON.stringify({
			action: "QUEUE_JOIN_TOURNAMENT",
			payload: {}
		}));
	
		const backBtn = document.getElementById('backBtn');
		backBtn?.addEventListener('click', () => {
			cleanupMatchmaking();
			history.pushState(null, '', '/mode');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
}