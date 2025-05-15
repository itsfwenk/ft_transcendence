import { fetchUserProfile } from "./mode";
import { getMatchmakingSocket } from "../wsClient";
import { getAvatarUrl } from "./profile";

export default async function Queuetournament() {
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
    console.log("Rendu du joueur:", playerName, "avec l'avatar:", avatarUrl);

    const boxId = `player-${playerId.slice(0, 8)}`;

    if (avatarUrl) {
      console.log("Test de l'URL de l'avatar:", avatarUrl);
      
      return `
      <div id="${boxId}" class="w-16 h-16 bg-blue-600 text-white flex items-center justify-center text-2xl rounded-md cube-3d">
        <img 
        src="${avatarUrl}" 
        alt="${playerName}" 
        class="w-full h-full object-cover"
        onload="console.log('Image chargée avec succès:', '${avatarUrl}')"
        onerror="console.log('Erreur de chargement image:', '${avatarUrl}'); this.onerror=null; this.src='/avatars/default.png';"
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
  
  app.innerHTML = /*html*/`
    <div class="text-black font-jaro text-9xl mt-16 mb-36 select-none">Pong Game</div>
    <div class="flex flex-col items-center justify-center">
      <div class="flex flex-col items-center justify-center w-1/3 bg-blue-700 rounded-md">
        <h1 class="text-6xl mb-9 pt-2 font-jaro">Tournament</h1>
        <div id="players-grid" class="flex items-center justify-center gap-3">
          <div id="player1-container">
            ${renderPlayerBox(currentPlayerId, userProfile.userName || "You", currentPlayerAvatar)}
          </div>
          <div id="player2-container">
            <div class="w-16 h-16 bg-white rounded-md cube-3d"></div>
          </div>
          <div id="player3-container">
            <div class="w-16 h-16 bg-white rounded-md cube-3d"></div>
          </div>
          <div id="player4-container">
            <div class="w-16 h-16 bg-white rounded-md cube-3d"></div>
          </div>
        </div>
        <p id="status-message" class="text-white font-inria font-bold pt-5 m-5">searching for players...</p>
      </div>
      <div id="backBtn" class='button w-24 h-13 mt-10 bg-gray-700 rounded-full cursor-pointer select-none
        hover:translate-y-2 hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
        hover:border-b-[0px]
        transition-all duration-150 [box-shadow:0_10px_0_0_#181818,0_15px_0_0_#1b70f841]
        border-b-[1px] border-gray-400'>
        <span class='flex flex-col justify-center items-center h-full text-white font-jaro'>Back</span>
      </div>
    </div>
  `;

  const ws = getMatchmakingSocket();
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error("Pas de connexion WebSocket disponible");
    return;
  }
  
  function cleanupMatchmaking() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log("Envoi du message de départ de la file d'attente");
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
      console.log("Message reçu:", msg);

      switch (msg.type) {
        case 'QUEUE_TOURNAMENT_PLAYER_JOINED':
          const list: {userId: string; userName: string}[] = msg.players;
          updatePlayersDisplay(list);
          break;
        case 'QUEUE_TOURNAMENT_PLAYER_LEFT':
          removePlayerFromDisplay(msg.playerId);
          break;
        case 'TOURNAMENT_LAUNCH':
          const playerList = msg.payload?.tournament?.players?.map((playerId: string) => {
            const playerFromList = msg.players?.find((p: any) => p.userId === playerId);
            return { 
              userId: playerId, 
              userName: playerFromList?.userName || "Player" 
            };
          }) || [];
          
          startCountdown(msg.payload.tournament.id, playerList);
          break;
      }    
    } catch (error) {
      console.error("Erreur lors du traitement du message:", error);
    }
  }

  function updatePlayersDisplay(players: {userId: string; userName: string}[]) {
    document.querySelectorAll('[id^="player"][id$="-container"]').forEach((container, index) => {
      if (index > 0) {
        container.innerHTML = `<div class="w-16 h-16 bg-white rounded-md cube-3d"></div>`;
      }
    });
    
    let playerIndex = 1; 
    for (const player of players) {
      if (player.userId === currentPlayerId) continue;
      
      const containerSelector = `#player${playerIndex + 1}-container`;
      const container = document.querySelector(containerSelector);
      
      if (container && playerIndex < 4) {
        const avatarUrl = getAvatarUrl(player.userId);
        container.innerHTML = renderPlayerBox(player.userId, player.userName || "Player", avatarUrl);
        playerIndex++;
      }
    }
    
    const statusMessage = document.getElementById('status-message');
    if (statusMessage) {
      if (players.length >= 4) {
        statusMessage.textContent = "Waiting for tournament to start...";
      } else {
        statusMessage.textContent = `Waiting for more players... (${players.length}/4)`;
      }
    }
  }

  function removePlayerFromDisplay(playerId: string) {
    if (playerId === currentPlayerId) return;
    
    const playerNode = document.getElementById(`player-${playerId.slice(0, 8)}`);
    if (!playerNode) return;
    
    const container = playerNode.closest('[id^="player"][id$="-container"]');
    if (container) {
      container.innerHTML = `<div class="w-16 h-16 bg-white rounded-md cube-3d"></div>`;
    }
  }

  function startCountdown(tournamentId: string, players?: {userId: string; userName: string}[]) {
    if (players && players.length > 0) {
      updatePlayersDisplay(players);
    }
    
    const backBtn = document.getElementById('backBtn');
    const statusMessage = document.getElementById('status-message');
    
    if (backBtn) backBtn.classList.add('hidden');
    
    let timeLeft = 3;
    
    if (statusMessage) {
      statusMessage.textContent = `Tournament starting in ${timeLeft}...`;
    }
    
    const intervalId = setInterval(() => {
      timeLeft--;
      
      if (statusMessage && timeLeft >= 0) {
        statusMessage.textContent = `Tournament starting in ${timeLeft}...`;
      }
      
      if (timeLeft < 0) {
        clearInterval(intervalId);
        cleanupMatchmaking();
        window.location.href = `/tournament?tournament_Id=${tournamentId}`;
      }
    }, 1000);
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