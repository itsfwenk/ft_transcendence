import { getMatchmakingSocket } from "../wsClient";
import { fetchUserProfile } from "./mode";
import { getAvatarUrl } from "./profile";
import i18n from '../i18n';

// Faire trad !!!!

//let cleanupMatchmakingFn: () => void;

export async function fetchUserAvatar(userId: string): Promise<string> {
  try {
    const response = await fetch(`/user/avatar/${userId}`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.warn(`${i18n.t('queue.errorFetchingAvatar')} (${response.status}): ${response.statusText}`);
      return "";
    }
    
    const data = await response.json();
    console.log(`${i18n.t('queue.avatarDataReceived')}:`, data);
    
    if (data.avatarUrl) {
      console.log(`${i18n.t('queue.avatarUrlFound')}:`, data.avatarUrl);
      return data.avatarUrl;
    } else {
      console.warn(i18n.t('queue.noAvatarUrlInResponse'));
      return "";
    }
  } catch (error) {
    console.error(`${i18n.t('queue.errorFetchingAvatar')}:`, error);
    return "";
  }
}

// function show1v1ResultScreen(
//   isWinner: boolean,
//   scores: { score1: number; score2: number }
// ) {
//   const app = document.getElementById('app');
//   if (!app) return;
  
//   if (cleanupMatchmakingFn) {
//     cleanupMatchmakingFn();
//   }
  
//   app.innerHTML = `
//     <div class="min-h-screen flex flex-col items-center justify-center bg-white text-black px-4">
//       <h2 class="text-3xl font-bold mb-4">
//         ${isWinner ? '🎉 Victoire !' : '😢 Défaite'}
//       </h2>
  
//       <p class="mb-6 text-lg">Score : ${scores.score1} – ${scores.score2}</p>
  
//       <button id="backBtn"
//           class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded">
//         Retour au menu
//       </button>
//     </div>
//   `;
  
//   document.getElementById('backBtn')?.addEventListener('click', () => {
//     history.pushState(null, '', '/menu');
//     window.dispatchEvent(new PopStateEvent('popstate'));
//   });
// }

export default async function Queue() {
	const app = document.getElementById('app');
	if (!app) return;
  
	const userProfile = await fetchUserProfile();
	if (!userProfile) {
		console.error("Aucun utilisateur connecté");
		return;
	}
  
	const currentPlayerId = userProfile.userId;
	console.log("currentPlayerId:", currentPlayerId);

	const currentPlayerAvatar = getAvatarUrl(currentPlayerId);
	console.log("Avatar de l'utilisateur actuel:", currentPlayerAvatar);
  
  function renderPlayerBox(playerId: string, playerName: string, avatarUrl: string) {

    const boxId = `player-${playerId.slice(0, 8)}`;
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
  }
  
  app.innerHTML = /*html*/`
    <div class="text-black font-jaro text-9xl mt-16 mb-36 select-none">${i18n.t('general.pongGame')}</div>
    <div class="flex flex-col items-center justify-center">
      <div class="flex flex-col items-center justify-center w-1/3 bg-blue-700 rounded-md">
      <h1 class="text-6xl mb-9 pt-2 font-jaro">${i18n.t('gameMode.1v1Online')}</h1>
      <div class="flex items-center justify-center gap-3">
        <div id="player1-container">
        ${renderPlayerBox(currentPlayerId, userProfile.userName || i18n.t('queue.you'), currentPlayerAvatar)}
        </div>
        <div id="player2-container">
        <div class="w-16 h-16 bg-white rounded-md cube-3d"></div>
        </div>
      </div>
      <p id="status-message" class="text-white font-inria font-bold pt-5 m-5">${i18n.t('queue.searchingOpponent')}</p>
      </div>
      <div id="backBtn" class='button w-24 h-13 mt-10 bg-gray-700 rounded-full cursor-pointer select-none
      hover:translate-y-2 hover:[box-shadow:0_0px_0_0_#000000,0_0px_0_0_#00000041]
      hover:border-b-[0px]
      transition-all duration-150 [box-shadow:0_10px_0_0_#000000,0_15px_0_0_#00000041]
      border-b-[1px] border-gray-400'>
      <span class='flex flex-col justify-center items-center h-full text-white font-jaro'>${i18n.t('general.back')}</span>
      </div>
    </div>
  `;

  const ws = getMatchmakingSocket();
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error(i18n.t('gameMode.socketNotConnected'));
    return;
  }
  ws.removeEventListener('message', handleMessage1v1);

  function updateOpponentDisplay(player: {userId: string; userName: string}) {
    if (player.userId === currentPlayerId) return; 
    
    const container = document.getElementById('player2-container');
    if (container) {
      const avatarUrl = getAvatarUrl(player.userId);
      container.innerHTML = renderPlayerBox(player.userId, player.userName || i18n.t('queue.opponent'), avatarUrl);
    }
    
    const statusMessage = document.getElementById('status-message');
    if (statusMessage) {
      statusMessage.textContent = i18n.t('queue.opponentFound');
    }
  }

  function startCountdown1v1(gameSessionId: string, opponent?: {userId: string; userName: string}, delay?: number) {
    if (opponent) {
      updateOpponentDisplay(opponent);
    }
    
    const backBtn = document.getElementById('backBtn');
    const statusMessage = document.getElementById('status-message');
    
    if (backBtn) backBtn.classList.add('hidden');
    
    let timeLeft = delay ?? 5;
    
    if (statusMessage) {
      statusMessage.textContent = i18n.t('queue.gameStartingIn') + timeLeft;
    }
    
    const intervalId = setInterval(() => {
      timeLeft--;
      
      if (statusMessage && timeLeft >= 0) {
        statusMessage.textContent = i18n.t('queue.gameStartingIn') + timeLeft;
      }
      
      if (timeLeft < 0) {
        clearInterval(intervalId);
		cleanupMatchmaking(); 
        history.pushState(null, '', `/game?gameSessionId=${gameSessionId}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }, 1000);
  }
  
  // Définir la fonction de nettoyage
  function cleanupMatchmaking() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log("Cleanup matchmaking queue1v1");
      ws.removeEventListener('message', handleMessage1v1);
    }
  }
  
  //cleanupMatchmakingFn = cleanupMatchmaking;

  function handleMessage1v1(event: MessageEvent) {
    try {
      const msg = JSON.parse(event.data);
      console.log(`${i18n.t('queue.messageReceived')}:`, msg);

      switch (msg.type) {
        case 'QUEUE_1V1_PLAYER_JOINED':
          const { userId, userName } = msg.player;
          if (!userId || userId === currentPlayerId) break;
          
          updateOpponentDisplay({userId, userName: userName || i18n.t('queue.opponent')});
          break;
          
        case 'QUEUE_1V1_PLAYER_LEFT':
          const container = document.getElementById('player2-container');
          if (container) {
            container.innerHTML = `<div class="w-16 h-16 bg-white rounded-md cube-3d"></div>`;
          }
          
          const statusMessage = document.getElementById('status-message');
          if (statusMessage) {
            statusMessage.textContent = i18n.t('queue.opponentLeft');
          }
          break;
          
        case 'MATCH_PREP':
          const gameSessionId = msg.payload.gameSessionId;
          const opponent = msg.payload.opponent || {
            userId: msg.payload.opponentId, 
            userName: i18n.t('queue.opponent')
          };
		  const delay = Number(import.meta.env.VITE_1V1_LAUNCH_DELAY ?? '5');
          startCountdown1v1(gameSessionId, opponent, delay);
          break;
      }    
    } catch (error) {
      console.error(`${i18n.t('queue.errorProcessingMessage')}:`, error);
    }
  }

  const handlePageUnload = () => {
	if (ws && ws.readyState === WebSocket.OPEN) {
		ws.send(JSON.stringify({
				action: 'QUEUE_LEAVE_1V1',
				payload: {playerId: currentPlayerId}
		}));
	}
	cleanupMatchmaking();
  };

  window.addEventListener('beforeunload', handlePageUnload);

	//ws.addEventListener('message', handleMessage1v1);
	ws.onmessage = handleMessage1v1;


  ws.send(JSON.stringify({
    action: "QUEUE_JOIN_1V1",
    payload: {}
  }));

  const backBtn = document.getElementById('backBtn');
  backBtn?.addEventListener('click', () => {
	if (ws && ws.readyState === WebSocket.OPEN) {
		ws.send(JSON.stringify({
				action: 'QUEUE_LEAVE_1V1',
				payload: {playerId: currentPlayerId}
		}));
	}
    cleanupMatchmaking();
    history.pushState(null, '', '/mode');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}