export function initOnlineGame(){
    const socket = new WebSocket("ws://localhost:3000/ws");
	// // When the connection opens
	// socket.onopen = () => {
	// 	console.log('Connected to the Pong server');
	// // Optionally, send an initial message or request game state
	// // socket.send(JSON.stringify({ type: 'init' }));
  	// };

    let canvas: HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) {
     throw new Error('Failed to get 2D context');
    }

	// // Paddle settings
	// const paddleWidth = 10, paddleHeight = 80, paddleSpeed = 5;
	// Paddle settings
	const paddleWidth = 10, paddleHeight = 80;

    interface GameState {
        leftPaddle: { x: number; y: number; dy: number };
        rightPaddle: { x: number; y: number; dy: number };
        ball: { x: number; y: number; radius: number; dx: number; dy: number};
        player1Score: number;
        player2Score: number;
    }

	let gameState: GameState = {
		leftPaddle: {
			x: 0,
			y: canvas.height / 2 - paddleHeight / 2,
			dy: 0
		},
		rightPaddle: {
			x: canvas.width - 10,
			y: canvas.height / 2 - paddleHeight / 2,
			dy: 0 
		},
		ball: {
			x: canvas.width / 2,
			y: canvas.height / 2,
			radius: 7,
			dx: Math.random() > 0.5 ? 3 : -3,
			dy: Math.random() > 0.5 ? 3 : -3,
		},
		player1Score: 0,
		player2Score: 0
	  };

	// Send player movements to the server
	document.addEventListener("keydown", (event) => {
		if (["w", "s", "ArrowUp", "ArrowDown"].includes(event.key)) {
		socket.send(JSON.stringify({ type: "move", key: event.key }));
		}
	});

	// Receive game state from server
	socket.onmessage = (event) => {
		gameState = JSON.parse(event.data);
		drawGame();
	};
	
	// Draw game objects
	function drawGame() {
		if (ctx) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		
			// Draw paddles
			ctx.fillStyle = "blue";
			ctx.fillRect(gameState.leftPaddle.x, gameState.leftPaddle.y, paddleWidth, paddleHeight);
			
			ctx.fillStyle = "red";
			ctx.fillRect(gameState.rightPaddle.x, gameState.rightPaddle.y, paddleWidth, paddleHeight);
		
			// Draw ball
			ctx.beginPath();
			ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
			ctx.fillStyle = "red";
			ctx.fill();
			ctx.closePath();
		
			// Draw scores
			ctx.fillStyle = "black";
			ctx.font = "20px Arial";
			ctx.textAlign = "center";  // Centers the text horizontally
      		ctx.textBaseline = "top";  // Aligns the text from the top
			ctx.fillText(`${gameState.player1Score}`, canvas.width / 4, 30);
			ctx.fillText(`${gameState.player2Score}`, (canvas.width * 3) / 4, 30);
		}
	}
}
initOnlineGame()
