import { getMatchmakingSocket } from "../wsClient";
import { getAvatarUrl } from "./profile";
import { Game, gamePalette } from '../../gameInterfaces'
import i18n from '../i18n';

// export interface Ball {
// 	x: number;
// 	y: number;
// 	radius: number;
// 	dx: number;
// 	dy: number
// }

// export interface Paddle {
// 	x: number;
// 	y: number;
// 	dy: number
// }

// export interface Game {
// 	gameId: string;
// 	player1_id: string;
// 	player2_id: string;
// 	score1: number;
// 	score2: number;
// 	leftPaddle: Paddle;
// 	rightPaddle: Paddle;
// 	ball: Ball;
// 	status: 'waiting' | 'ongoing' | 'finished';
// 	winner_id?: string | null;
// 	matchId?: string | null;
// 	canvasWidth: number;
// 	canvasHeight: number;
// }
const canvasWidth: number = parseInt(import.meta.env.VITE_CANVAS_WIDTH as string, 10);
const canvasHeight: number = parseInt(import.meta.env.VITE_CANVAS_HEIGHT as string, 10);
const paddleWidth: number = parseInt(import.meta.env.VITE_PADDLE_WIDTH as string, 10);
const paddleHeight: number = parseInt(import.meta.env.VITE_PADDLE_HEIGHT as string, 10);
// const paddleSpeed: number = parseInt(import.meta.env.VITE_PADDLE_SPEED as string, 10);
const ballRadius: number = parseInt(import.meta.env.VITE_BALL_RADIUS as string, 10);
// const speedIncrease: number = parseFloat(import.meta.env.VITE_SPEED_INCREASE as string);

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

export default async function game() {
	const params = new URLSearchParams(location.search);
  	const gameId = params.get('gameSessionId');
	// if (!gameId || !(await checkGameExistsAndNotFinished(gameId))) {
	// 	console.log("finished");
    // 	return showError(i18n.t('game.errorLink'));
  	// }

	// function showError(text: string) {
	// 	const app = document.getElementById('app')!;
	// 	app.innerHTML = `
	// 		<div class="flex flex-col items-center justify-center h-screen">
	// 		<p class="text-4xl mb-6 font-jaro text-red-500">${text}</p>
    //             <div 
    //                 id="backBtn"
    //                 class='button w-24 h-13 mt-10 bg-gray-700 rounded-full cursor-pointer select-none
    //                     hover:translate-y-2 
    //                     hover:[box-shadow:0_0px_0_0_#000000,0_0px_0_0_#00000041]
    //                     hover:border-b-[0px]
    //                     transition-all duration-150
    //                     [box-shadow:0_10px_0_0_#000000,0_15px_0_0_#00000041]
    //                     border-b-[1px] border-gray-400'
    //                 data-shadow-main="#000000"
    //                 data-shadow-accent="#00000041"
    //                 data-border-color="#4D4D4D"
    //             >
    //                 <span class='flex flex-col justify-center items-center h-full text-white font-jaro'>${i18n.t('general.back')}</span>
    //             </div>
	// 		</div>`;
	// 	document.getElementById('backBtn')!
	// 		.addEventListener('click', () => {
	// 		history.pushState(null, '', '/mode');
	// 		window.dispatchEvent(new PopStateEvent('popstate'));
	// 		});
	// }

	// async function checkGameExistsAndNotFinished(id: string): Promise<boolean> {
	// 	const baseUrl = window.location.origin;
	// 	const res = await fetch(`${baseUrl}/game/${id}/status`)
	// 	if (!res.ok) return false;
	// 	const { status } = await res.json();
	// 	return status !== 'finished';
	// }

    let gameStarted = false;
	let canvas: HTMLCanvasElement | null;
	let ctx: CanvasRenderingContext2D | null;
	let countdownInterval: number | null = null;

	const savedThemeString = localStorage.getItem('selectedGamePalette');
  	let gamePalette: gamePalette;

	if (savedThemeString) {
		try {
			gamePalette = JSON.parse(savedThemeString);
		} catch (e) {
			console.error("Could not parse saved game palette, falling back to default:", e);
			gamePalette = {
				background: "#DDDDDD",
				paddle1: "#4F46E5",
				paddle2: "#DC2626",
				ball: "black",
				line: "rgba(0, 0, 0, 0.2)",
				score: "rgba(200, 200, 200, 0.7)"
			};
		}
	} else {
		gamePalette = {
			background: "#DDDDDD",
			paddle1: "#4F46E5",
			paddle2: "#DC2626",
			ball: "black",
			line: "rgba(0, 0, 0, 0.2)",
			score: "rgba(200, 200, 200, 0.7)"
		};
	}


    function keydownHandler(e: KeyboardEvent) {
		if (["ArrowUp", "ArrowDown"].includes(e.key)) {
			e.preventDefault();
		}
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
		if (countdownInterval) clearInterval(countdownInterval);
        document.removeEventListener('keydown', keydownHandler);
        document.removeEventListener('keyup', keyupHandler);
		document.removeEventListener('click', doForfeit);
    }

	function doForfeit() {                                       
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({ type: 'FORFEIT' }));        
			socket.close(1000, 'player quit');                       
		}
  		makeBackButton(); 
	}

	function updateMatchType(type: string) {
        const matchType = document.getElementById('match-type');
        if (matchType) {
            matchType.textContent = type;
			matchType.classList.add('select-none');
        }
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

	function initGameUI() {
		canvas   = document.getElementById('game-canvas') as HTMLCanvasElement;
		ctx      = canvas?.getContext('2d') ?? null;

		const quitBtn = document.getElementById('quit-btn')!;
		quitBtn.addEventListener('click', doForfeit);
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
		
		<!-- Conteneur du canvas avec bordure -->
		<div id="game-wrapper" class="inline-block">
			<!-- Sous-titre -->
			<div id="match-type"
				class="text-left text-gray-600 text-2xl mb-2 ml-3 font-jaro">
				${i18n.t('general.loading')}
			</div>

			<!-- === Bloc canvas + overlay ==================================== -->
			<div id="canvas-box"
					class="relative inline-block border-4 border-black bg-gray-300">
				<canvas id="game-canvas" width="${canvasWidth}" height="${canvasHeight}" class="block"></canvas>

				<!-- Overlay centré sur le canvas, transparent pour voir le jeu en arrière-plan -->
				<div id="result-overlay"
					class="hidden absolute inset-0 flex flex-col justify-center items-center
							pointer-events-none z-10">
					<div class="bg-white bg-opacity-70 rounded-lg shadow-lg px-8 py-6 text-center
							border-2 border-gray-300">
						<h2 id="overlay-title" class="text-5xl font-bold mb-3 font-jaro"></h2>
						<p id="overlay-subtitle" class="text-xl font-medium font-jaro"></p>
					</div>
				</div>
			</div>

			<!-- badge statut (facultatif, reste au même niveau que le canvas) -->
			<div id="game-status"
				class="absolute top-2 right-4 px-2 py-0.5
						bg-black/70 text-white text-xs rounded hidden">
				${i18n.t('game.statusWaiting')}
			</div>
		</div>

		<div class="flex justify-center mt-8">
			<div id="quit-btn" class="button h-14 w-32 bg-red-600 rounded-lg cursor-pointer select-none
				hover:translate-y-2 hover:[box-shadow:0_0px_0_0_#A31F1F,0_0px_0_0_#A31F1F41]
				hover:border-b-[0px]
				transition-all duration-150 [box-shadow:0_10px_0_0_#A31F1F,0_15px_0_0_#A31F1F41]
				border-b-[1px] border-red-400">
				<span class="flex flex-col justify-center items-center h-full text-white font-jaro text-xl">${i18n.t('game.quit')}</span>
			</div>
		</div>
		`;
	initGameUI();

	let countdown = Number(import.meta.env.VITE_GAME_LAUNCH_DELAY ?? '5');
	if (Number.isNaN(countdown) || countdown <= 0) countdown = 5;

	console.log("countdown", countdown);

	showOverlay(i18n.t('game.countdownBegin'), String(countdown), 'text-blue-700');

	countdownInterval = window.setInterval(() => {
		countdown--;
		if (countdown > 0) {
			showOverlay(i18n.t('game.countdownBegin'), String(countdown), 'text-blue-700');
		} else {
			clearInterval(countdownInterval!);
			hideOverlay();
			if (socket.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify({ type: 'ready_to_start' }));
			}
		}
	}, 1000);

	function showOverlay(title: string, subtitle = '', color = 'text-black') {
		const overlay = document.getElementById('result-overlay');
		const titleEl = document.getElementById('overlay-title');
		const subtitleEl = document.getElementById('overlay-subtitle');
		
		if (!overlay || !titleEl || !subtitleEl) return;
		
		titleEl.textContent = title;
		titleEl.className = `text-5xl font-bold mb-3 font-jaro ${color}`;
		
		subtitleEl.textContent = subtitle;
		subtitleEl.className = subtitle ? 'text-xl font-medium font-jaro text-gray-800' : 'hidden';
		
		overlay.classList.remove('hidden');
		overlay.classList.add('flex');
	}

	function hideOverlay() {
		const overlay = document.getElementById('result-overlay');
		if (!overlay) return;
		
		overlay.classList.add('hidden');
		overlay.classList.remove('flex');
	}

    
	let config = false;
	socket.onmessage = async (event) => {
		const data = JSON.parse(event.data);
		if (!config && data.type != 'game_start') {
			console.log("Ajout des AVATAR");
			const player1Id = data.game_state.player1_id;
			const player2Id = data.game_state.player2_id;
			console.log("player1Id", player1Id);

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
		switch (data.type) {
			case 'game_start':
				gameStarted = true;
				break;
			case 'game_update':
				renderGame(data.game_state as Game);
				if (data.game_state.status === 'finished') {
					socket.close(); cleanup();
				}
			break;
		}
	};

	socket.onclose = () => {
		console.log("WebSocket déconnecté du serveur de jeu");
	};

	socket.onerror = (error) => {
		console.error("Erreur WebSocket:", error);
	};

	document.addEventListener('keydown', keydownHandler);
	document.addEventListener('keyup', keyupHandler);
            
	function renderGame(state: Game) {
		if (!ctx || !canvas || !gameStarted) return;
		// const canvasWidth = canvas.width;
		// const canvasHeight = canvas.height;
		// const paddleWidth = parseInt(import.meta.env.VITE_PADDLE_WIDTH as string, 10);
		// const paddleHeight = parseInt(import.meta.env.VITE_PADDLE_HEIGHT as string, 10);
		// const ballRadius = parseInt(import.meta.env.VITE_BALL_RADIUS as string, 10);
		
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		ctx.fillStyle = gamePalette.background;
    	ctx.fillRect(0, 0, canvas.width, canvas.height);
		// Dessiner la ligne centrale
		ctx.beginPath();
		ctx.setLineDash([5, 5]); // Ligne en pointillé
		ctx.moveTo(canvasWidth / 2, 0);
		ctx.lineTo(canvasWidth / 2, canvasHeight);
		ctx.strokeStyle = gamePalette.line;
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.setLineDash([]);
		
		// Dessiner la raquette gauche
		ctx.fillStyle = gamePalette.paddle1;
		ctx.fillRect(0, state.leftPaddle.y, paddleWidth, paddleHeight);
		
		// Dessiner la raquette droite
		ctx.fillStyle = gamePalette.paddle2;
		ctx.fillRect(canvasWidth - paddleWidth, state.rightPaddle.y, paddleWidth, paddleHeight);
		
		// Dessiner les scores
		ctx.font = 'bold 120px Arial';
		ctx.fillStyle = gamePalette.score;
		ctx.textAlign = 'center';
		
		// Score gauche
		ctx.fillText(state.score1.toString(), canvasWidth / 4, canvasHeight / 2 + 40);
		
		// Score droit
		ctx.fillText(state.score2.toString(), (canvasWidth / 4) * 3, canvasHeight / 2 + 40);

		// Dessiner la balle en noir au centre
		ctx.beginPath();
		ctx.arc(state.ball.x, state.ball.y, ballRadius, 0, Math.PI * 2);
		ctx.fillStyle = gamePalette.ball;
		ctx.fill();
		ctx.closePath();
	}

	function handleMessageGame(event: MessageEvent) {
		try {
		const msg = JSON.parse(event.data);
		console.log("Message reçu:", msg);

		switch (msg.type) {
			case 'PLAYER_STATE_UPDATE':
				showResultOverlay(msg.payload.state)
				break;
			case 'MATCH_PREP':
				const gameSessionId = msg.payload.gameSessionId;
				history.pushState(null, '', `/game?gameSessionId=${gameSessionId}`);
				window.dispatchEvent(new PopStateEvent('popstate'));
				break;
		}    
		} catch (error) {
		console.error("Erreur lors du traitement du message:", error);
		}
 	}

	function cleanupMatchmaking() {
		if (ws && ws.readyState === WebSocket.OPEN) {
			console.log("Cleanup matchmaking game");
			ws.removeEventListener('message', handleMessageGame);
		}
	}
	
	const handlePageUnload = () => {
		doForfeit();
		cleanupMatchmaking();
	};

	
	window.addEventListener('beforeunload', handlePageUnload);

	const ws = getMatchmakingSocket();

	if (!ws || ws.readyState !== WebSocket.OPEN) {
		console.error("Pas de connexion WebSocket disponible");
		return;
	}
	ws.removeEventListener('message', handleMessageGame);

	window.addEventListener('beforeunload', handlePageUnload);

	ws.onmessage = handleMessageGame;

	function makeBackButton() {
		const quitBtn = document.getElementById('quit-btn');
		if (!quitBtn) return;

		const btnContainer = quitBtn.parentNode;
		if (!btnContainer || !(btnContainer instanceof HTMLElement)) return;

		btnContainer.innerHTML = `
			<div id="back-btn" class="button h-14 w-32 bg-blue-700 rounded-lg cursor-pointer select-none
				hover:translate-y-2 hover:[box-shadow:0_0px_0_0_#193cb8,0_0px_0_0_#1b70f841]
				hover:border-b-[0px]
				transition-all duration-150 [box-shadow:0_10px_0_0_#193cb8,0_15px_0_0_#1b70f841]
				border-b-[1px] border-blue-400">
				<span class="flex flex-col justify-center items-center h-full text-white font-jaro text-xl">${i18n.t('general.back')}</span>
			</div>
		`;

		document.getElementById('back-btn')?.addEventListener('click', () => {
			history.pushState(null, '', '/mode');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
	}


	function showResultOverlay(state: 'eliminated'|'waiting_next_round'|'waiting_final'|'winner') {
	let title = '';
	let subtitle = '';
	let color = '';

	switch (state) {
		case 'waiting_next_round':
		title = i18n.t('game.resultWin');
		subtitle = i18n.t('game.waitingOpponent');
		color = 'text-green-600';
		const quitBtn = document.getElementById('quit-btn');
		if (quitBtn) quitBtn.classList.add('hidden');
		break;
		case 'eliminated':
		title = i18n.t('game.resultLose');
		subtitle = i18n.t('game.nextTime');
		color = 'text-red-600';
		makeBackButton();
		break;
		case 'waiting_final':
		title = i18n.t('game.resultWin');
		subtitle = i18n.t('game.finalPreparation');
		color = 'text-green-600';
		const quitBtnFinal = document.getElementById('quit-btn');
		if (quitBtnFinal) quitBtnFinal.classList.add('hidden');
		break;
		case 'winner':
		title = i18n.t('game.resultWin');
		subtitle = i18n.t('game.congratulations');
		color = 'text-green-600';
		makeBackButton();
		break;
	}

	showOverlay(title, subtitle, color);
	
	if (state === 'eliminated' || state === 'winner') {
		makeBackButton();
	}
	}
}