import { getAvatarUrl } from "./profile";
import i18n from '../i18n';

// src/pages/Home.ts
interface Ball {
    x: number;
    y: number;
    radius: number;
    dx: number;
    dy: number
}

interface Paddle {
    x: number;
    y: number;
    dy: number
}

interface Game {
    gameId: string;
    player1_id: string;
    player2_id: string;
    score1: number;
    score2: number;
    leftPaddle: Paddle;
    rightPaddle: Paddle;
    ball: Ball;
    status: 'waiting' | 'ongoing' | 'finished';
    winner_id?: string | null;
    matchId?: string | null;
    canvasWidth: number;
    canvasHeight: number;
}

async function fetchMatchType(matchId: string): Promise<string> {
  try {
    if (!matchId) {
      console.warn("Impossible de récupérer le type de match: matchId manquant");
      return i18n.t('gameMode.1v1Online');
    }

    const baseUrl = window.location.origin;
    const response = await fetch(`${baseUrl}/matchmaking/matches/${matchId}/type`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.warn(`Erreur lors de la récupération du type de match: ${response.status} ${response.statusText}`);
      return i18n.t('gameMode.1v1Online');
    }
    
    const data = await response.json();
    console.log("Type de match récupéré:", data.matchType);
    
    const matchTypeKey = mapMatchTypeToI18nKey(data.matchType);
    return i18n.t(matchTypeKey);
  } catch (error) {
    console.error('Erreur lors de la récupération du type de match:', error);
    return i18n.t('gameMode.1v1Online');
  }
}

function mapMatchTypeToI18nKey(matchType: string): string {
  if (!matchType) return 'gameMode.1v1Online';
  
  const lowerCaseType = matchType.toLowerCase();
  
  if (lowerCaseType.includes('tournament') && lowerCaseType.includes('semifinal')) {
    return 'tournament.semifinalMatch';
  } else if (lowerCaseType.includes('tournament') && lowerCaseType.includes('final')) {
    return 'tournament.finalMatch';
  } else if (lowerCaseType.includes('1v1') && lowerCaseType.includes('online')) {
    return 'gameMode.1v1Online';
  } else if (lowerCaseType.includes('1v1') && lowerCaseType.includes('local')) {
    return 'gameMode.1v1Local';
  }
  
  return 'gameMode.commonMatchType';
}

export default function game() {
    let gameStarted = false;
    
    function keydownHandler(e: KeyboardEvent) {
        if (socket && socket.readyState === WebSocket.OPEN && gameStarted) {
            let key = '';
            if (e.key === 'ArrowUp' || e.key === 'w') {
                key = 'ArrowUp';
            } else if (e.key === 'ArrowDown' || e.key === 's') {
                key = 'ArrowDown';
            }
            if (key) {
                socket.send(JSON.stringify({ type: 'input', key: key, state: 'keydown' }));
            }
        }
    }

    function keyupHandler(e: KeyboardEvent) {
        if (socket && socket.readyState === WebSocket.OPEN && gameStarted) {
            let key = '';
            if (e.key === 'ArrowUp' || e.key === 'w') {
                key = 'ArrowUp';
            } else if (e.key === 'ArrowDown' || e.key === 's') {
                key = 'ArrowDown';
            }
            if (key) {
                socket.send(JSON.stringify({ type: 'input', key: key, state: 'keyup' }));
            }
        }
    }

    function cleanup() {
        console.log("Cleaning up...");
        
        document.removeEventListener('keydown', keydownHandler);
        document.removeEventListener('keyup', keyupHandler);

        const app = document.getElementById('app');
        if (app) app.innerHTML = '';
    }

    function doForfeit() {                                       
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'FORFEIT' }));        
            socket.close(1000, 'player quit');                       
        }
        history.pushState(null, '', '/mode');                      
        window.dispatchEvent(new PopStateEvent('popstate'));       
    }

    function updateGameStatus(status: string) {
        const gameStatus = document.getElementById('game-status');
        if (gameStatus) {
            if (status === 'ongoing') {
                gameStatus.textContent = i18n.t('game.statusOngoing');
            } else if (status === 'waiting') {
                gameStatus.textContent = i18n.t('game.statusWaiting');
            } else if (status === 'finished') {
                gameStatus.textContent = i18n.t('game.statusFinished');
            }
        }
    }

    function updateMatchType(type: string) {
        const matchType = document.getElementById('match-type');
        if (matchType) {
            matchType.textContent = type;
        }
    }

    let wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:${window.location.port}/game/ws`;
    console.log(`wsUrl :`, wsUrl);
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
        console.log("WebSocket connecté au serveur de jeu");
    };

    const app = document.getElementById('app');
    if (!app) {
        console.error("Error retrieving app");
        return;
    }

    app.innerHTML = /*html*/`
		<!-- En-tête avec titre et photos de profil -->
		<div class="flex justify-center items-center mb-2">
			<!-- Photo de profil joueur 1 -->
			<div class="w-30 h-30 mr-20 bg-pink-500 rounded-md flex items-center justify-center text-white">
				<img id="player1-avatar" src="/avatars/default.png" alt="${i18n.t('game.player1')}" 
						class="w-full h-full object-cover rounded-md"
						onerror="this.src='/avatars/default.png'">
			</div>
			
			<!-- Titre du jeu -->
			<div class="text-black font-jaro text-9xl mt-16 mb-20 select-none">${i18n.t('general.pongGame')}</div>

			<!-- Photo de profil joueur 2 -->
			<div class="w-30 h-30 ml-20 bg-yellow-500 rounded-md flex items-center justify-center text-white">
				<img id="player2-avatar" src="/avatars/default.png" alt="${i18n.t('game.player2')}" 
						class="w-full h-full object-cover rounded-md"
						onerror="this.src='/avatars/default.png'">
			</div>
		</div>
		
		<!-- Sous-titre indiquant le type de match -->
		<div class="text-left text-gray-600 text-2xl mb-2 ml-3 font-jaro" id="match-type">${i18n.t('general.loading')}</div>
		
		<!-- Conteneur du canvas avec bordure -->
			<div class="relative">
				<div class="border-4 border-black bg-white">
					<canvas id="game-canvas" width="800" height="400" class="w-full"></canvas>
				</div>
				<!-- Statut du jeu en haut -->
				<div id="game-status" class="absolute top-2 right-4 px-2 py-0.5 bg-black bg-opacity-50 text-white text-xs rounded hidden">
				${i18n.t('game.statusWaiting')}
				</div>
			</div>
			<div class="flex justify-center mt-4">
				<button id="quit-btn" class="px-2 py-2 bg-red-600 text-white rounded hover:bg-red-700">${i18n.t('game.quit')}</button>
			</div>
		`;

	function updatePlayerAvatars(player1Id: string, player2Id: string) {
		const player1Avatar = document.getElementById('player1-avatar') as HTMLImageElement;
		const player2Avatar = document.getElementById('player2-avatar') as HTMLImageElement;
		
		if (player1Avatar && player1Id) {
			player1Avatar.src = getAvatarUrl(player1Id);
		}
		
		if (player2Avatar && player2Id) {
			player2Avatar.src = getAvatarUrl(player2Id);
		}
	}

    // Configuration du jeu
    let timeLeft = 0;
    const intervalId = setInterval(() => {
        if (timeLeft === 0) {
            clearInterval(intervalId);

            const quitBtn = document.getElementById('quit-btn');
            if (quitBtn) {
                quitBtn.addEventListener('click', doForfeit);
            } else {
                console.warn("Bouton Quitter non trouvé dans la structure HTML");
            }

            window.addEventListener('beforeunload', doForfeit);
            
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'ready_to_start' }));
            }

            const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
            if (!canvas) {
                console.error("Canvas non trouvé dans la structure HTML");
                return;
            }

            canvas.width = parseInt(import.meta.env.VITE_CANVAS_WIDTH as string, 10);
            canvas.height = parseInt(import.meta.env.VITE_CANVAS_HEIGHT as string, 10);
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error("Impossible d'obtenir le contexte 2D du canvas.");
                return;
            }

            document.addEventListener('keydown', keydownHandler);
            document.addEventListener('keyup', keyupHandler);
            
			let config = false;

            socket.onmessage = async (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log("datatype =", data.type);
                    console.log("data :", data);
                    
					if (!config) {
						console.log("Ajout des AVATAR");
						const player1Id = data.game_state.player1_id;
						const player2Id = data.game_state.player2_id;

						const matchId = data.game_state?.matchId || data.matchId;
						if (matchId) {
							try {
							const matchType = await fetchMatchType(matchId);
							updateMatchType(matchType);
							} catch (error) {
							console.warn("Impossible de récupérer le type de match:", error);
							updateMatchType(i18n.t('gameMode.1v1Online'));
							}
						} else {
							updateMatchType(i18n.t('gameMode.1v1Online'));
						}
						updatePlayerAvatars(player1Id, player2Id);
						config = true;
					}

                    if (data.type === 'game_start') {
                        console.log("Le jeu a démarré!");
                        gameStarted = true;
                        updateGameStatus('ongoing');
                    } else if (data.type === 'game_update' && data.game_state.ball && data.game_state.status === 'ongoing') {
                        gameStarted = true;
                        renderGame(data.game_state as Game);
                    } else if (data.type === 'game_update' && data.game_state.status === 'finished') {
                        renderGame(data.game_state as Game);
                        updateGameStatus('finished');
                        console.log("Game finished");
                        socket.close();
                        cleanup();
                    }
                } catch (error) {
                    console.error("Erreur lors du traitement du message WebSocket:", error);
                }
            };
            
            socket.onclose = () => {
                console.log("WebSocket déconnecté du serveur de jeu");
            };
            
            socket.onerror = (error) => {
                console.error("Erreur WebSocket:", error);
            };
            
            function renderGame(state: Game) {
                if (!ctx || !state || !gameStarted) return;
                
                console.log("game id:", state.gameId);
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const paddleWidth = parseInt(import.meta.env.VITE_PADDLE_WIDTH as string, 10);
                const paddleHeight = parseInt(import.meta.env.VITE_PADDLE_HEIGHT as string, 10);
                const ballRadius = parseInt(import.meta.env.VITE_BALL_RADIUS as string, 10);
                
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                
                // Dessiner la ligne centrale
                ctx.beginPath();
                ctx.setLineDash([5, 5]); // Ligne en pointillé
                ctx.moveTo(canvasWidth / 2, 0);
                ctx.lineTo(canvasWidth / 2, canvasHeight);
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.setLineDash([]);
                
                
                // Dessiner la raquette gauche
                ctx.fillStyle = '#4F46E5';
                ctx.fillRect(0, state.leftPaddle.y, paddleWidth, paddleHeight);
                
                // Dessiner la raquette droite
                ctx.fillStyle = '#DC2626';
                ctx.fillRect(canvasWidth - paddleWidth, state.rightPaddle.y, paddleWidth, paddleHeight);
                
                // Dessiner les scores
                ctx.font = 'bold 120px Arial';
                ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
                ctx.textAlign = 'center';
                
                // Score gauche
                ctx.fillText(state.score1.toString(), canvasWidth / 4, canvasHeight / 2 + 40);
                
                // Score droit
                ctx.fillText(state.score2.toString(), (canvasWidth / 4) * 3, canvasHeight / 2 + 40);

                // Dessiner la balle en noir au centre
                ctx.beginPath();
                ctx.arc(state.ball.x, state.ball.y, ballRadius, 0, Math.PI * 2);
                ctx.fillStyle = 'black';
                ctx.fill();
                ctx.closePath();
            }
        }
    }, 1000);
}