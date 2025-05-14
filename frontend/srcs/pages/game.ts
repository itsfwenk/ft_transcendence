// src/pages/Home.ts
import { Game } from '../../gameInterfaces'

// let gameState : Game;
// const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
// const host = window.location.hostname;
// const port = window.location.port;
// const path = '/ws';


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

    app.innerHTML = '';

    // const timerDisplay = document.createElement('div');
    // timerDisplay.id = 'timer';
    // timerDisplay.style.fontSize = '2em';
    // timerDisplay.style.fontFamily = 'sans-serif';
    // timerDisplay.style.marginTop = '20px';
    // app.appendChild(timerDisplay);

    let timeLeft = 0;
    // timerDisplay.textContent = `Ready...`;
    const intervalId = setInterval(() => {
        // timeLeft--;
        // timerDisplay.textContent = `Get set...`;
        // if (timeLeft === 1)
            // timerDisplay.textContent = 'GO !';
        if (timeLeft === 0) {
            clearInterval(intervalId);
            // timerDisplay.style.display = 'none';
            // timerDisplay.textContent = 'GO !';
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'ready_to_start' }));
            }

            const existingCanvas = document.getElementById('GameCanvas');
            if (existingCanvas) {
                console.warn("Removing old canvas");
                existingCanvas.remove();
            }

            const canvas = document.createElement('canvas');
            canvas.id = 'GameCanvas';
            canvas.width = parseInt(import.meta.env.VITE_CANVAS_WIDTH as string, 10);
            canvas.height = parseInt(import.meta.env.VITE_CANVAS_HEIGHT as string, 10);
            canvas.classList.add('border-2', 'border-gray-400', 'bg-white');
            app.appendChild(canvas);
        
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error("Impossible d'obtenir le contexte 2D du canvas.");
                return;
            }

            const existingScoreDisplay = document.getElementById('scoreDisplayDiv');
            if (existingScoreDisplay) {
                console.warn("Removing old scoreDisplay");
                existingScoreDisplay.remove();
            }
            const scoreDisplay = document.createElement('div');
            scoreDisplay.id = 'scoreDisplayDiv'
            scoreDisplay.className = 'mt-4';
            scoreDisplay.innerHTML = 'Score: <span id="score1">0</span> - <span id="score2">0</span>';
            app.appendChild(scoreDisplay);
        
        
            // const lancerButton = document.createElement('button');
            // lancerButton.id = 'lancerBtn';
            // lancerButton.className = 'bg-blue-600 text-white px-4 py-2 rounded mt-4';
            // lancerButton.textContent = 'Lancer';
            // app.appendChild(lancerButton);
        
            // const gameStateDisplay = document.createElement('p');
            // gameStateDisplay.id = 'gameState';
            // gameStateDisplay.textContent = 'En attente du lancement par les deux joueurs...';
            // app.appendChild(gameStateDisplay);
        
            const score1Display = document.getElementById('score1');
            const score2Display = document.getElementById('score2');
            // const lancerBtn = document.getElementById('lancerBtn') as HTMLButtonElement;
            // const gameStateLabel = document.getElementById('gameState');
        
            // let gameStarted = false;
            
            // let currentGameState: Game;
        
            // socket.onopen = () => {
            //     console.log("WebSocket connecté au serveur de jeu");
            //     console.log("canvas :", canvas.width, canvas.height);
            //     socket.send(JSON.stringify({
            //         type: 'canvas_size',
            //         width: canvas.width,
            //         height: canvas.height,
            //     }));
            // };
        
            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log("datatype =", data.type);
                    console.log("data :", data);
                    if (data.type === 'game_start') {
                        console.log("Le jeu a démarré!");
                        gameStarted = true;
                        // if (gameStateLabel) {
                        //     gameStateLabel.textContent = "Partie en cours!";
                        // }
                        // if (lancerBtn) {
                        //     lancerBtn.style.display = 'none'; // Hide the button once the game starts
                        // }
                    } else if (data.type === 'game_update' && data.game_state.ball && data.game_state.status === 'ongoing') {
                        // currentGameState = data;
                        gameStarted = true;
                        renderGame(data.game_state as Game); //  Call renderGame
                    } else if (data.type === 'game_update' && data.game_state.status === 'finished') {
                        // currentGameState = data;
                        renderGame(data.game_state as Game);
                        console.log("Game finished");
                        // if (gameStateLabel) {
                        //     gameStateLabel.textContent = "Partie terminée!";
                        // }
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
        
                // Event listener for the "Lancer" button
                // lancerBtn.addEventListener('click', () => {
                //     if (socket && socket.readyState === WebSocket.OPEN) {
                //         socket.send(JSON.stringify({ type: 'ready_to_start' }));
                //         lancerBtn.textContent = 'En attente de l\'autre joueur...';
                //         lancerBtn.disabled = true;
                //     }
                // });
            
                // Keyboard event listeners for player input
                document.addEventListener('keydown', keydownHandler);
                document.addEventListener('keyup', keyupHandler);
            
                function renderGame(state: Game) {
                    if (!ctx || !state || !gameStarted) return;
                    console.log("game id:", state.gameId);
                    const canvasWidth = canvas.width;
                    const canvasHeight = canvas.height;
                    const paddleWidth = parseInt(import.meta.env.VITE_PADDLE_WIDTH as string, 10);
                    const paddleHeight = parseInt(import.meta.env.VITE_PADDLE_HEIGHT as string, 10);
                    const ballRadius = parseInt(import.meta.env.VITE_BALL_RADIUS as string, 10);
                    console.log("paddleWidth :", paddleWidth, "paddleHeight :", paddleHeight, "ballRadius :", ballRadius);
                    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            
                    ctx.fillStyle = 'blue';
                    ctx.fillRect(0, state.leftPaddle.y, paddleWidth, paddleHeight);
                    ctx.fillStyle = 'red';
                    ctx.fillRect(canvasWidth - paddleWidth, state.rightPaddle.y, paddleWidth, paddleHeight);
            
                    ctx.beginPath();
                    ctx.arc(state.ball.x, state.ball.y, ballRadius, 0, Math.PI * 2);
                    ctx.fillStyle = 'black';
                    ctx.fill();
                    ctx.closePath();
            
                    if (score1Display && score2Display) {
                        score1Display.textContent = state.score1.toString();
                        score2Display.textContent = state.score2.toString();
                    }
                    // if (gameStateLabel && state.status === 'finished') {
                    //     // gameStateLabel.textContent = "Partie terminée!";
                    // }
                }
        }
    }, 1000);
}