import { getMatchmakingSocket } from "../wsClient";
import { fetchUserProfile } from "./mode";
import { getAvatarUrl } from "./profile";

export async function fetchUserAvatar(userId: string): Promise<string> {
  try {
    const response = await fetch(`/user/avatar/${userId}`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.warn(`Erreur lors de la récupération de l'avatar (${response.status}): ${response.statusText}`);
      return "";
    }
    
    const data = await response.json();
    console.log("Données d'avatar reçues:", data);
    
    if (data.avatarUrl) {
      console.log("URL d'avatar trouvée:", data.avatarUrl);
      return data.avatarUrl;
    } else {
      console.warn("Aucune URL d'avatar trouvée dans la réponse");
      return "";
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'avatar:", error);
    return "";
  }
}

function show1v1ResultScreen(
	isWinner: boolean,
	scores: { score1: number; score2: number }
	) {
	const app = document.getElementById('app');
	if (!app) return;
	
	app.innerHTML = `
	  <div class="min-h-screen flex flex-col items-center justify-center bg-white text-black px-4">
		<h2 class="text-3xl font-bold mb-4">
		  ${isWinner ? '🎉 Victoire !' : '😢 Défaite'}
		</h2>
	
		<p class="mb-6 text-lg">Score : ${scores.score1} – ${scores.score2}</p>
	
		<button id="backBtn"
				class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded">
		  Retour au menu
		</button>
	  </div>
	`;
	
	document.getElementById('backBtn')?.addEventListener('click', () => {
		history.pushState(null, '', '/menu');
		window.dispatchEvent(new PopStateEvent('popstate'));
	});
}

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
			<h1 class="text-6xl mb-9 pt-2 font-jaro">1v1 online</h1>
			<div class="flex items-center justify-center gap-3">
				<div id="player1-container">
				${renderPlayerBox(currentPlayerId ,userProfile.userName || "You", currentPlayerAvatar)}
				</div>
				<div id="player2-container">
				<div class="w-16 h-16 bg-white rounded-md cube-3d"></div>
				</div>
			</div>
			<p id="status-message" class="text-white font-inria font-bold pt-5 m-5">searching for opponent...</p>
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
				action: 'QUEUE_LEAVE_1V1',
				payload: {playerId: currentPlayerId}
			}));
			ws.removeEventListener('message', handleMessage);
		}
	}

	function updateOpponentDisplay(player: {userId: string; userName: string}) {
		if (player.userId === currentPlayerId) return;
		
		const container = document.getElementById('player2-container');
		if (container) {
			const avatarUrl = getAvatarUrl(player.userId);
			container.innerHTML = renderPlayerBox(player.userId, player.userName || "Opponent", avatarUrl);
		}
		
		const statusMessage = document.getElementById('status-message');
		if (statusMessage) {
			statusMessage.textContent = "Opponent found! Get ready...";
		}
	}

	function startCountdown(gameSessionId: string, opponent?: {userId: string; userName: string}) {
		if (opponent) {
			updateOpponentDisplay(opponent);
		}
		
		const backBtn = document.getElementById('backBtn');
		const statusMessage = document.getElementById('status-message');
		
		if (backBtn) backBtn.classList.add('hidden');
		
		let timeLeft = 5;
		
		if (statusMessage) {
			statusMessage.textContent = `Game starting in ${timeLeft}...`;
		}
		
		const intervalId = setInterval(() => {
			timeLeft--;
			
			if (statusMessage && timeLeft >= 0) {
				statusMessage.textContent = `Game starting in ${timeLeft}...`;
			}
			
			if (timeLeft < 0) {
				clearInterval(intervalId);
				cleanupMatchmaking();
				window.location.href = `/game?gameSessionId=${gameSessionId}`;
			}
		}, 1000);
	}

	async function handleMessage(event: MessageEvent) {
		try {
			const msg = JSON.parse(event.data);
			console.log("Message reçu:", msg);

			switch (msg.type) {
				case 'QUEUE_1V1_PLAYER_JOINED':
					const { userId, userName } = msg.player;
					if (!userId || userId === currentPlayerId) break;
					
					updateOpponentDisplay({userId, userName: userName || "Opponent"});
					break;
					
				case 'QUEUE_1V1_PLAYER_LEFT':
					const container = document.getElementById('player2-container');
					if (container) {
						container.innerHTML = `<div class="w-16 h-16 bg-white rounded-md cube-3d"></div>`;
					}
					
					const statusMessage = document.getElementById('status-message');
					if (statusMessage) {
						statusMessage.textContent = "Opponent left. Searching for new opponent...";
					}
					break;
					
				case 'MATCH_START':
					const gameSessionId = msg.payload.gameSessionId;
					const opponent = msg.payload.opponent || {
						userId: msg.payload.opponentId, 
						userName: "Opponent"
					};
					
					startCountdown(gameSessionId, opponent);
					break;
					
				case 'MATCH_END':
					console.log("Message MATCH_END reçu:", msg.payload);
					const {winner_Id, score1, score2} = msg.payload;
					console.log("Identifiant du gagnant:", winner_Id);
					console.log("Identifiant du joueur actuel:", currentPlayerId);
					const isWinner = winner_Id === currentPlayerId;
					console.log("Est-ce que je suis le gagnant?", isWinner);
					console.log("Scores:", score1, score2);
					show1v1ResultScreen(isWinner, {score1, score2});
					break;
			}		
		} catch (error) {
			console.error("Erreur lors du traitement du message:", error);
		}
	}

	const handlePageUnload = () => {
		cleanupMatchmaking();
	}

	window.addEventListener('beforeunload', handlePageUnload);

	ws.addEventListener('message', handleMessage);

	ws.send(JSON.stringify({
		action: "QUEUE_JOIN_1V1",
		payload: {}
	}));

	const backBtn = document.getElementById('backBtn');
	backBtn?.addEventListener('click', () => {
		cleanupMatchmaking();
		history.pushState(null, '', '/mode');
		window.dispatchEvent(new PopStateEvent('popstate'));
	});
}