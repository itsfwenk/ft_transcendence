let isPaused = false;

export function initGame(){
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = /*html*/`
      <div class="flex flex-col items-center">
        <div class="text-black font-jaro text-9xl mt-16 mb-20 select-none">Pong Game</div>
        
        <!-- Conteneur avec bordures -->
		<div class="self-start text-gray-600 text-2xl mb-2 ml-27 font-jaro select-none" id="match-type">1v1 local</div>
        <div class="border-4 border-black bg-white relative">
          <canvas id="gameCanvas" width="1000" height="500" class="w-full"></canvas>
        </div>
        
        <div class="mt-4 space-x-2">
          <button id="pauseLocalBtn" class="p-3 mr-5 bg-red-500 text-white rounded hover:bg-red-600">Pause</button>
          <a href="/menu" data-link id="btnHome" class="h-16 p-3 bg-blue-700 text-white rounded hover:bg-blue-800">Home</a>
        </div>
      </div>
    `;
  }
  let canvas: HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }

  // Paddle settings
  const paddleWidth = 10, paddleHeight = 80, paddleSpeed = 5;

  interface Paddle {
    x: number;
    y: number;
    dy: number;
  }

  interface Ball {
    x: number;
    y: number;
    radius: number;
    dx: number;
    dy: number;
  }

  let player1Score = 0;
  let player2Score = 0;

  // Left paddle (Player 1)
  let leftPaddle: Paddle = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    dy: 0
  };

  // Right paddle (Player 2 or AI)
  let rightPaddle: Paddle = {
    x: canvas.width - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    dy: 0
  };

  // Ball settings
  let ball: Ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 7,
    dx: Math.random() > 0.5 ? 3 : -3,
    dy: Math.random() > 0.5 ? 3 : -3,
  };

  // Variables pour stocker l'état du jeu pendant la pause
  let lastBallX = 0;
  let lastBallY = 0;
  let lastBallDx = 0;
  let lastBallDy = 0;
  
  // Sauvegarder l'état du jeu avant la pause
  function saveGameState() {
    lastBallX = ball.x;
    lastBallY = ball.y;
    lastBallDx = ball.dx;
    lastBallDy = ball.dy;
  }
  
  // Restaurer l'état du jeu après la pause
  function restoreGameState() {
    ball.x = lastBallX;
    ball.y = lastBallY;
    ball.dx = lastBallDx;
    ball.dy = lastBallDy;
  }

  // Keyboard event listeners
  document.addEventListener("keydown", (event) => {
    if (!isPaused) {
      if (event.key === "w") leftPaddle.dy = -paddleSpeed;
      if (event.key === "s") leftPaddle.dy = paddleSpeed;
      if (event.key === "ArrowUp") rightPaddle.dy = -paddleSpeed;
      if (event.key === "ArrowDown") rightPaddle.dy = paddleSpeed;
    }
  });

  document.addEventListener("keyup", (event) => {
    if (!isPaused) {
      if (event.key === "w" || event.key === "s") leftPaddle.dy = 0;
      if (event.key === "ArrowUp" || event.key === "ArrowDown") rightPaddle.dy = 0;
    }
  });

  document.getElementById('pauseLocalBtn')?.addEventListener('click', pauseGame);

function pauseGame() {
	isPaused = !isPaused;
	
	let pauseOverlay = document.getElementById('pauseOverlay');
	const btnHome = document.getElementById('btnHome');
	const btnPause = document.getElementById('pauseLocalBtn');

	if (!pauseOverlay) {
		pauseOverlay = document.createElement('div');
		pauseOverlay.id = 'pauseOverlay';
		pauseOverlay.className = 'absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-10 hidden';
		pauseOverlay.innerHTML = `
		<div class="text-white text-4xl font-bold mb-6">JEU EN PAUSE</div>
		<button id="resumeBtn" class="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg text-xl">
			Reprendre
		</button>
		`;
		
		const canvasContainer = document.querySelector('.border-4.border-black');
		if (canvasContainer) {
		canvasContainer.appendChild(pauseOverlay);
		}
		
		document.getElementById('resumeBtn')?.addEventListener('click', () => {
		pauseGame();
		});
	}
	
	if (isPaused) {
		if (btnHome && btnPause) {
			btnHome.classList.add('hidden');
			btnPause.classList.add('hidden');
		}
		pauseOverlay.classList.remove('hidden');
		const pauseBtn = document.getElementById('pauseLocalBtn');
		if (pauseBtn) pauseBtn.textContent = 'Reprendre';
	} else {
		pauseOverlay.classList.add('hidden');
		if (btnHome && btnPause) {
			btnHome.classList.remove('hidden');
			btnPause.classList.remove('hidden');
		}
		const pauseBtn = document.getElementById('pauseLocalBtn');
		if (pauseBtn) pauseBtn.textContent = 'Pause';
	}
}

  // Update paddle positions
function update() {
	leftPaddle.y += leftPaddle.dy;
	rightPaddle.y += rightPaddle.dy;

	// Prevent paddles from moving off-screen
	leftPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, leftPaddle.y));
	rightPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, rightPaddle.y));

	// Ball collision with top and bottom walls
	if (ball.y - ball.radius <= 0) {
		ball.dy *= -1; // Reverse direction
		ball.y += 3;
	}
	else if (ball.y + ball.radius >= canvas.height) {
		ball.dy *= -1; // Reverse direction
		ball.y -= 3;
	}

	// Define constant ball speed
	// const BALL_SPEED = 5;
	const SPEED_INCREASE = 1.1;

	// Normalize ball speed after paddle hit
	// function normalizeBallSpeed() {
	//     let speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
	//     ball.dx = (ball.dx / speed) * BALL_SPEED;
	//     ball.dy = (ball.dy / speed) * BALL_SPEED;
	// }

	// Ball collision with paddles (with speed normalization)
	if (
		ball.x - ball.radius <= leftPaddle.x + paddleWidth &&
		ball.y >= leftPaddle.y && ball.y <= leftPaddle.y + paddleHeight
	) {
		let relativeIntersectY = ball.y - (leftPaddle.y + paddleHeight / 2);
		let normalizedIntersectY = relativeIntersectY / (paddleHeight / 2);
		
		ball.dx *= -1; // Reverse horizontal direction
		ball.dy = normalizedIntersectY * Math.abs(ball.dx);; // Adjust vertical direction
		ball.x += 2;

		ball.dx *= SPEED_INCREASE;
		ball.dy *= SPEED_INCREASE;
		// normalizeBallSpeed(); // Keep speed constant
	}

	if (
		ball.x + ball.radius >= rightPaddle.x &&
		ball.y >= rightPaddle.y && ball.y <= rightPaddle.y + paddleHeight
	) {
		let relativeIntersectY = ball.y - (rightPaddle.y + paddleHeight / 2);
		let normalizedIntersectY = relativeIntersectY / (paddleHeight / 2);
		
		ball.dx *= -1; // Reverse horizontal direction
		ball.dy = normalizedIntersectY * Math.abs(ball.dx); // Adjust vertical direction
		ball.x -= 2;
		// normalizeBallSpeed(); // Keep speed constant

		ball.dx *= SPEED_INCREASE;
		ball.dy *= SPEED_INCREASE;
  }

	// Ball movement
	ball.x += ball.dx;
	ball.y += ball.dy;

	// Reset ball if it goes past paddles
	// if (ball.x < 0 || ball.x > canvas.width) {
	//     ball.x = canvas.width / 2;
	//     ball.y = canvas.height / 2;
	//     ball.dx = -ball.dx;
	// }
	// Reset ball if it goes past paddles
	if (ball.x < 0) { 
		player2Score++; // Player 2 scores a point
		resetBall();
	} else if (ball.x > canvas.width) { 
		player1Score++; // Player 1 scores a point
		resetBall();
	}

	function resetBall() {
		ball.x = canvas.width / 2;
		ball.y = canvas.height / 2;
		ball.dx = Math.random() > 0.5 ? 3 : -3;
		ball.dy = Math.random() > 0.5 ? 3 : -3;
	}
}

  // Draw paddles and ball
  function draw() {
	const canvasWidth = canvas.width;
	const canvasHeight = canvas.height;
	const paddleWidth = parseInt(import.meta.env.VITE_PADDLE_WIDTH as string, 10);
	const paddleHeight = parseInt(import.meta.env.VITE_PADDLE_HEIGHT as string, 10);
	const ballRadius = parseInt(import.meta.env.VITE_BALL_RADIUS as string, 10);

    if (ctx) {
		ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas	
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
		ctx.fillRect(0, leftPaddle.y, paddleWidth, paddleHeight);
		
		// Dessiner la raquette droite
		ctx.fillStyle = '#DC2626';
		ctx.fillRect(canvasWidth - paddleWidth, rightPaddle.y, paddleWidth, paddleHeight);
		
		// Dessiner les scores
		ctx.font = 'bold 120px Arial';
		ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
		ctx.textAlign = 'center';
		
		// Score gauche
		ctx.fillText(`${player1Score}`, canvasWidth / 4, canvasHeight / 2 + 40);
		
		// Score droit
		ctx.fillText(`${player2Score}`, (canvasWidth / 4) * 3, canvasHeight / 2 + 40);

		// Dessiner la balle en noir au centre
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
		ctx.fillStyle = 'black';
		ctx.fill();
		ctx.closePath();
    }
  }

  // Game loop
  function loop() {
    if (!isPaused) {
      saveGameState(); // Sauvegarder l'état avant update
      update();
    } else {
      restoreGameState(); // Maintenir la balle à sa dernière position
    }
    
    draw();
    requestAnimationFrame(loop);
  }
  loop()
}