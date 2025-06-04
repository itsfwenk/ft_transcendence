export function pauseGame() {
  alert("Game paused. Click OK to resume.");
}

export function initGame(){
  let canvas: HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }

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

  let leftPaddle: Paddle = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    dy: 0
  };

  let rightPaddle: Paddle = {
    x: canvas.width - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    dy: 0
  };

  let ball: Ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 7,
    dx: Math.random() > 0.5 ? 3 : -3,
    dy: Math.random() > 0.5 ? 3 : -3,
  };

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

  function update() {
    leftPaddle.y += leftPaddle.dy;
    rightPaddle.y += rightPaddle.dy;

    leftPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, leftPaddle.y));
    rightPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, rightPaddle.y));

    if (ball.y - ball.radius <= 0) {
        ball.dy *= -1;
        ball.y += 3;
    }
    else if (ball.y + ball.radius >= canvas.height) {
        ball.dy *= -1;
        ball.y -= 3;
    }

    const SPEED_INCREASE = 1.1;

    if (
        ball.x - ball.radius <= leftPaddle.x + paddleWidth &&
        ball.y >= leftPaddle.y && ball.y <= leftPaddle.y + paddleHeight
    ) {
        let relativeIntersectY = ball.y - (leftPaddle.y + paddleHeight / 2);
        let normalizedIntersectY = relativeIntersectY / (paddleHeight / 2);
        
        ball.dx *= -1;
        ball.dy = normalizedIntersectY * Math.abs(ball.dx);;
        ball.x += 2;

        ball.dx *= SPEED_INCREASE;
        ball.dy *= SPEED_INCREASE;
    }

    if (
        ball.x + ball.radius >= rightPaddle.x &&
        ball.y >= rightPaddle.y && ball.y <= rightPaddle.y + paddleHeight
    ) {
        let relativeIntersectY = ball.y - (rightPaddle.y + paddleHeight / 2);
        let normalizedIntersectY = relativeIntersectY / (paddleHeight / 2);
        
        ball.dx *= -1;
        ball.dy = normalizedIntersectY * Math.abs(ball.dx);
        ball.x -= 2;

        ball.dx *= SPEED_INCREASE;
        ball.dy *= SPEED_INCREASE;
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x < 0) { 
      player2Score++;
      resetBall();
    } else if (ball.x > canvas.width) { 
      player1Score++;
      resetBall();
    }

    function resetBall() {
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      ball.dx = Math.random() > 0.5 ? 3 : -3;
      ball.dy = Math.random() > 0.5 ? 3 : -3;
    }
  }

  function draw() {
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "blue";
      ctx.fillRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight);

      ctx.fillStyle = "red";
      ctx.fillRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight);

      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "red";
      ctx.fill();
      ctx.closePath();

      ctx.fillStyle = "black";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      ctx.fillText(`${player1Score}`, canvas.width / 4, 30);
      ctx.fillText(`${player2Score}`, (canvas.width * 3) / 4, 30);
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }
  loop()
}

initGame()