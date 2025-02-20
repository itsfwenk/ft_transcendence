function pauseGame() {
  alert("Game paused. Click OK to resume.");
}

(window as any).pauseGame = pauseGame;

function initGame(){
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
  let leftPaddle = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    dy: 0
  };

  // Right paddle (Player 2 or AI)
  let rightPaddle = {
    x: canvas.width - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    dy: 0
  };

  // Ball settings
  let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 7,
    dx: Math.random() > 0.5 ? 3 : -3,
    dy: Math.random() > 0.5 ? 3 : -3,
  };

  // Keyboard event listeners
  document.addEventListener("keydown", (event) => {
    if (event.key === "w") leftPaddle.dy = -paddleSpeed;
    if (event.key === "s") leftPaddle.dy = paddleSpeed;
    if (event.key === "ArrowUp") rightPaddle.dy = -paddleSpeed;
    if (event.key === "ArrowDown") rightPaddle.dy = paddleSpeed;
  });

  document.addEventListener("keyup", (event) => {
    if (event.key === "w" || event.key === "s") leftPaddle.dy = 0;
    if (event.key === "ArrowUp" || event.key === "ArrowDown") rightPaddle.dy = 0;
  });

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
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

      // Draw left paddle
      ctx.fillStyle = "blue";
      ctx.fillRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight);

      // Draw right paddle
      ctx.fillStyle = "red";
      ctx.fillRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight);

      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      ctx.fill();
      ctx.closePath();

      // Draw scores in the center
      ctx.fillStyle = "black";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";  // Centers the text horizontally
      ctx.textBaseline = "top";  // Aligns the text from the top

      ctx.fillText(`${player1Score}`, canvas.width / 4, 30);
      ctx.fillText(`${player2Score}`, (canvas.width * 3) / 4, 30);
    }
  }

  // Game loop
  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }
  loop()
}

initGame()