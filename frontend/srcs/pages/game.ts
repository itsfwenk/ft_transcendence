// src/pages/Home.ts
import { Game } from "../../../backend/services/game/srcs/gameDb"

// let gameState : Game;
// const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
// const host = window.location.hostname;
// const port = window.location.port;
// const path = '/ws';

export default function game() {
    const app = document.getElementById('app');
    if (!app) {
        console.error("Error retrieving app");
        return;
    }

    app.innerHTML = '';

    const canvas = document.createElement('canvas');
    canvas.id = 'dynamicGameCanvas';
    canvas.classList.add('border-2', 'border-gray-400', 'bg-white');

    app.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Impossible d'obtenir le contexte 2D du canvas.");
        return;
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.7;

        if (gameStarted && currentGameState) {
            renderGame(currentGameState);
        }

        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: 'canvas_size',
                width: canvas.width,
                height: canvas.height,
            }));
        }
    }

    // resizeCanvas();
    window.addEventListener('resize', resizeCanvas);


    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'mt-4';
    scoreDisplay.innerHTML = 'Score: <span id="score1">0</span> - <span id="score2">0</span>';
    app.appendChild(scoreDisplay);


    const lancerButton = document.createElement('button');
    lancerButton.id = 'lancerBtn';
    lancerButton.className = 'bg-blue-600 text-white px-4 py-2 rounded mt-4';
    lancerButton.textContent = 'Lancer';
    app.appendChild(lancerButton);

    const gameStateDisplay = document.createElement('p');
    gameStateDisplay.id = 'gameState';
    gameStateDisplay.textContent = 'En attente du lancement par les deux joueurs...';
    app.appendChild(gameStateDisplay);

    const score1Display = document.getElementById('score1');
    const score2Display = document.getElementById('score2');
    const lancerBtn = document.getElementById('lancerBtn') as HTMLButtonElement;
    const gameStateLabel = document.getElementById('gameState');

    let gameStarted = false;
    let currentGameState: Game;

    let wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:${window.location.port}/game/ws`;

    console.log(`wsUrl :`, wsUrl);
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        console.log("WebSocket connecté au serveur de jeu");
        console.log("canvas :", canvas.width, canvas.height);
        socket.send(JSON.stringify({
            type: 'canvas_size',
            width: canvas.width,
            height: canvas.height,
        }));
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log("datatype =", data.type);
            if (data.type === 'game_start') {
                console.log("Le jeu a démarré!");
                gameStarted = true;
                if (gameStateLabel) {
                    gameStateLabel.textContent = "Partie en cours!";
                }
                if (lancerBtn) {
                    lancerBtn.style.display = 'none'; // Hide the button once the game starts
                }
            } else if (gameStarted && data.ball) {
                currentGameState = data;
                renderGame(data as Game); //  Call renderGame
            } else if (data.status === 'finished') {
                currentGameState = data;
                renderGame(data as Game);
                if (gameStateLabel) {
                    gameStateLabel.textContent = "Partie terminée!";
                }
                socket.close();
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
        lancerBtn.addEventListener('click', () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'ready_to_start' }));
                lancerBtn.textContent = 'En attente de l\'autre joueur...';
                lancerBtn.disabled = true;
            }
        });
    
        // Keyboard event listeners for player input
          document.addEventListener('keydown', (e) => {
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
        });
    
        document.addEventListener('keyup', (e) => {
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
        });
    
        // 7.  Render Game Function
        function renderGame(state: Game) {
            if (!ctx || !state || !gameStarted) return;
            console.log("game id:", state.gameId);
            const canvasWidth = canvas.width;  // Use dynamic width
            const canvasHeight = canvas.height; // Use dynamic height
            const paddleWidth = parseInt(process.env.PADDLE_WIDTH || '10', 10);
            const paddleHeight = parseInt(process.env.PADDLE_HEIGHT || '60', 10);
            const ballRadius = parseInt(process.env.BALL_RADIUS || '10', 10);
    
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
            ctx.fillStyle = 'black';
            ctx.fillRect(20, state.leftPaddle.y, paddleWidth, paddleHeight);
            ctx.fillRect(canvasWidth - 20 - paddleWidth, state.rightPaddle.y, paddleWidth, paddleHeight);
    
            ctx.beginPath();
            ctx.arc(state.ball.x, state.ball.y, ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'red';
            ctx.fill();
            ctx.closePath();
    
            if (score1Display && score2Display) {
                score1Display.textContent = state.score1.toString();
                score2Display.textContent = state.score2.toString();
            }
            if (gameStateLabel && state.status === 'finished') {
                gameStateLabel.textContent = "Partie terminée!";
            }
        }
//       app.innerHTML = `
//         <div class="flex flex-col items-center justify-center min-h-screen">
// <h1 class="text-3xl font-bold text-blue-600 mb-4">Partie en cours</h1>
//       <canvas id="pongCanvas" width="600" height="400" class="border-2 border-gray-400 bg-white"></canvas>
//       <div class="mt-4">
//         Score: <span id="score1">0</span> - <span id="score2">0</span>
//       </div>
//       <button id="lancerBtn" class="bg-blue-600 text-white px-4 py-2 rounded mt-4">Lancer</button>
//       <p id="gameState">En attente du lancement par les deux joueurs...</p>
//         </div>
//       `;
      
    //   const canvas = document.getElementById('pongCanvas') as HTMLCanvasElement;
    //   const ctx = canvas.getContext('2d');
    //   const lancerButton = document.getElementById('lancerBtn') as HTMLButtonElement;
    //   const gameStateDisplay = document.getElementById('gameState');
    //   const score1Display = document.getElementById('score1');
    //   const score2Display = document.getElementById('score2');


    //   if (!ctx) {
    //     console.error("Impossible d'obtenir le contexte 2D du canvas.");
    //     return;
    //   }

    //   const paddleWidth = parseInt(process.env.PADDLE_WIDTH || '10', 10);
    //   const paddleHeight = parseInt(process.env.PADDLE_HEIGHT || '60', 10);
    //   const ballRadius = parseInt(process.env.BALL_RADIUS || '10', 10);
    //   const canvasWidth = parseInt(process.env.CANVAS_WIDTH || '600', 10);
    //   const canvasHeight = parseInt(process.env.CANVAS_HEIGHT || '400', 10);
    // //   let gameStarted = false;

    //   function renderGame(state: Game) {
    //     if (!ctx || !state || !gameStarted) return;

    //     ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    //     ctx.fillStyle = 'black';
    //     ctx.fillRect(20, state.leftPaddle.y, paddleWidth, paddleHeight);
    //     ctx.fillRect(canvasWidth - 20 - paddleWidth, state.rightPaddle.y, paddleWidth, paddleHeight);

    //     ctx.beginPath();
    //     ctx.arc(state.ball.x, state.ball.y, ballRadius, 0, Math.PI * 2);
    //     ctx.fillStyle = 'red';
    //     ctx.fill();
    //     ctx.closePath();

    //     if (score1Display && score2Display) {
    //         score1Display.textContent = state.score1.toString();
    //         score2Display.textContent = state.score2.toString();
    //     }
    //     if (gameStateDisplay && state.status === 'finished') {
    //         gameStateDisplay.textContent = "Partie terminée!";
    //     }
    // }

    // const token = document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];
    // let   wsUrl = `${protocol}//${host}:${port}/game/ws`;
    // console.log(`wsUrl :`, wsUrl);
    // const socket = new WebSocket(wsUrl);

    // socket.onopen = () => {
    //     console.log("WebSocket connecté au serveur de jeu");
    // };

    // socket.onmessage = (event) => {
    //     try {
    //         const data = JSON.parse(event.data);
    //         if (data.type === 'game_start') {
    //             console.log("Le jeu a démarré!");
    //             gameStarted = true;
    //             if (gameStateDisplay) {
    //                 gameStateDisplay.textContent = "Partie en cours!";
    //             }
    //             if (lancerButton) {
    //                 lancerButton.style.display = 'none'; // Hide the button once the game starts
    //             }
    //         } else if (gameStarted && data.ball) {
    //             renderGame(data as Game);
    //         } else if (data.status === 'finished') {
    //             renderGame(data as Game);
    //             if (gameStateDisplay) {
    //                 gameStateDisplay.textContent = "Partie terminée!";
    //             }
    //             socket.close();
    //         }
    //     } catch (error) {
    //         console.error("Erreur lors du traitement du message WebSocket:", error);
    //     }
    // };

    // socket.onclose = () => {
    //     console.log("WebSocket déconnecté du serveur de jeu");
    // };

    // socket.onerror = (error) => {
    //     console.error("Erreur WebSocket:", error);
    // };

    // // Send a "ready_to_start" message when the button is clicked
    // lancerButton.addEventListener('click', () => {
    //     if (socket && socket.readyState === WebSocket.OPEN) {
    //         socket.send(JSON.stringify({ type: 'ready_to_start' }));
    //         if (lancerButton) {
    //             lancerButton.textContent = 'En attente de l\'autre joueur...';
    //             lancerButton.disabled = true;
    //         }
    //     }
    // });

    // document.addEventListener('keydown', (e) => {
    //     if (socket && socket.readyState === WebSocket.OPEN && gameStarted) {
    //         let key = '';
    //         if (e.key === 'ArrowUp' || e.key === 'w') {
    //             key = 'ArrowUp';
    //         } else if (e.key === 'ArrowDown' || e.key === 's') {
    //             key = 'ArrowDown';
    //         }
    //         if (key) {
    //             socket.send(JSON.stringify({ type: 'input', key: key, state: 'keydown' }));
    //         }
    //     }
    // });

    // document.addEventListener('keyup', (e) => {
    //     if (socket && socket.readyState === WebSocket.OPEN && gameStarted) {
    //         let key = '';
    //         if (e.key === 'ArrowUp' || e.key === 'w') {
    //             key = 'ArrowUp';
    //         } else if (e.key === 'ArrowDown' || e.key === 's') {
    //             key = 'ArrowDown';
    //         }
    //         if (key) {
    //             socket.send(JSON.stringify({ type: 'input', key: key, state: 'keyup' }));
    //         }
    //     }
    // });
}
      // const loginForm = document.getElementById('loginForm') as HTMLFormElement;
      // loginForm.addEventListener('submit', (e) => {
      //   e.preventDefault();

      //   console.log("Connexion...");
      // });
  
  //   }
  // }

// import { initGame, pauseGame } from './game-logics/local-logic.ts';

// export default function Game() {
//   const app = document.getElementById('app');
//   if (app) {
//     app.innerHTML = `
//       <div class="flex flex-col items-center">
//         <h1 class="text-3xl font-bold text-black p-2">Local Game</h1>
//         <canvas id="gameCanvas" width="800" height="400" class="mx-auto block border-8 border-gray-500 bg-white-700"></canvas>
//         <div class="mt-4 space-x-2">
//           <button id="pauseBtn" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Pause</button>
//           <a href="/" data-link class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Home</a>
//         </div>
//       </div>
//     `;

//     document.getElementById('pauseBtn')?.addEventListener('click', pauseGame);

//     initGame();
//   }
// }