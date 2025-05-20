// src/pages/Home.ts
//import { Game } from '../../gameInterfaces'

// let gameState : Game;
// const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
// const host = window.location.hostname;
// const port = window.location.port;
// const path = '/ws';

export interface Ball {
	x: number;
	y: number;
	radius: number;
	dx: number;
	dy: number
}

export interface Paddle {
	x: number;
	y: number;
	dy: number
}


export interface Game {
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



export default function game() {

    let gameStarted = false;
	let canvas: HTMLCanvasElement | null;
	let ctx: CanvasRenderingContext2D | null;
	let score1Display: HTMLElement | null;
	let score2Display: HTMLElement | null;
	let countdownInterval: number | null = null;

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
		if (countdownInterval) clearInterval(countdownInterval);
        console.log("Cleaning up...");
        // Remove canvas if present
        const canvas = document.getElementById('GameCanvas');
        if (canvas) {
            console.log("Removing canvas");
            canvas.remove();
        } else {
            console.warn("No canvas to remove");
        }

        // Remove score display
        const scoreDisplay = document.getElementById('scoreDisplayDiv');
        if (scoreDisplay) {
            scoreDisplay.remove(); 
        } else {
            console.warn("No scoreDisplay");
        }

        // Remove keyboard listeners
        document.removeEventListener('keydown', keydownHandler);
        document.removeEventListener('keyup', keyupHandler);

        // Clear #app to avoid canvas stacking
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

	function setupUI(app: HTMLElement, doForfeit: () => void): void {
		// 1. Canvas
		canvas?.remove();
		canvas = document.createElement('canvas');
		canvas.id = 'GameCanvas';
		canvas.width  = +import.meta.env.VITE_CANVAS_WIDTH;
		canvas.height = +import.meta.env.VITE_CANVAS_HEIGHT;
		canvas.className = 'border-2 border-gray-400 bg-white';
		app.appendChild(canvas);
		ctx = canvas.getContext('2d');

		// Score
		document.getElementById('scoreDisplayDiv')?.remove();
		const score = document.createElement('div');
		score.id = 'scoreDisplayDiv';
		score.className = 'mt-4';
		score.innerHTML = 'Score : <span id="score1">0</span> - <span id="score2">0</span>';
		app.appendChild(score);
		score1Display = document.getElementById('score1');
		score2Display = document.getElementById('score2');

		// 3. Bouton Quit
		let quit = document.getElementById('quitBtn');
		if (quit) quit.remove();
		quit = document.createElement('button');
		quit.id = 'quitBtn';
		quit.textContent = 'Quitter la partie';
		quit.className = 'mt-4 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500';
		quit.addEventListener('click', doForfeit);
		app.appendChild(quit);
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
	app.classList.add('relative');
    app.innerHTML = /*html*/'';
	setupUI(app, doForfeit);

	let countdown = Number(import.meta.env.VITE_GAME_LAUNCH_DELAY ?? '5');
	if (Number.isNaN(countdown) || countdown <= 0) countdown = 5;

	console.log("countdown", countdown);


	const overlay = document.createElement('div');
  	overlay.className =  'absolute inset-0 z-20 flex items-center justify-center ' +
  'pointer-events-none text-black text-3xl font-bold';
	overlay.textContent = `Begin in ${countdown}`;
	app.appendChild(overlay);
    countdownInterval = window.setInterval(() => {
		countdown--;
		if (countdown > 0) {
			overlay.textContent =
        `Begin in ${countdown}`;
		} else {
			clearInterval(countdownInterval!);
			overlay.remove();
			if (socket.readyState === WebSocket.OPEN) {
        		socket.send(JSON.stringify({ type: 'ready_to_start' }));
      		}
		}
	}, 1000);
        
	socket.onmessage = (event) => {
		const data = JSON.parse(event.data);
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
		const paddleWidth  = +import.meta.env.VITE_PADDLE_WIDTH;
		const paddleHeight = +import.meta.env.VITE_PADDLE_HEIGHT;
		const ballRadius   = +import.meta.env.VITE_BALL_RADIUS;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'blue';
		ctx.fillRect(0, state.leftPaddle.y, paddleWidth, paddleHeight);
		ctx.fillStyle = 'red';
		ctx.fillRect(canvas.width - paddleWidth, state.rightPaddle.y, paddleWidth, paddleHeight);

		ctx.beginPath();
		ctx.arc(state.ball.x, state.ball.y, ballRadius, 0, Math.PI * 2);
		ctx.fillStyle = 'black';
		ctx.fill();
		ctx.closePath();

		score1Display!.textContent = String(state.score1);
		score2Display!.textContent = String(state.score2);
	}

}