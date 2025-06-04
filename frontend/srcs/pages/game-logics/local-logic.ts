import i18n from "../../i18n";

let isPaused = false;
import { Paddle, Ball, gamePalette } from "../../../../gameInterfaces";

const canvasWidth: number = parseInt(
	import.meta.env.VITE_CANVAS_WIDTH as string,
	10
);
const canvasHeight: number = parseInt(
	import.meta.env.VITE_CANVAS_HEIGHT as string,
	10
);
const paddleWidth: number = parseInt(
	import.meta.env.VITE_PADDLE_WIDTH as string,
	10
);
const paddleHeight: number = parseInt(
	import.meta.env.VITE_PADDLE_HEIGHT as string,
	10
);
const paddleSpeed: number = parseInt(
	import.meta.env.VITE_PADDLE_SPEED as string,
	10
);
const ballRadius: number = parseInt(
	import.meta.env.VITE_BALL_RADIUS as string,
	10
);
const speedIncrease: number = parseFloat(
	import.meta.env.VITE_SPEED_INCREASE as string
);

export function initGame() {
	const app = document.getElementById("app");
	if (app) {
		app.innerHTML = /*html*/ `
      <div class="flex flex-col items-center">
        <div class="text-black font-jaro text-9xl mt-16 mb-20 select-none">${i18n.t(
			"general.pongGame"
		)}</div>
        
        <div id="game-wrapper" class="inline-block">
            <div id="match-type" class="text-left text-gray-600 text-2xl mb-2 ml-3 font-jaro select-none">
                ${i18n.t("localGame.matchType")}
            </div>

            <div id="canvas-box" class="border-4 border-black bg-white relative inline-block">
                <canvas id="gameCanvas" width="${canvasWidth}" height="${canvasHeight}" class="block"></canvas>
            </div>
        </div>
        
        <div class="mt-8 space-x-6 flex items-center justify-center">
          <div id="pauseLocalBtn" class="button h-14 w-32 bg-red-600 rounded-lg cursor-pointer select-none
            hover:translate-y-2 hover:[box-shadow:0_0px_0_0_#A31F1F,0_0px_0_0_#A31F1F41]
            hover:border-b-[0px]
            transition-all duration-150 [box-shadow:0_10px_0_0_#A31F1F,0_15px_0_0_#A31F1F41]
            border-b-[1px] border-red-400">
            <span class="flex flex-col justify-center items-center h-full text-white font-jaro text-xl">${i18n.t(
				"localGame.pause"
			)}</span>
          </div>

          <div id="btnHome" class="button h-14 w-32 bg-blue-700 rounded-lg cursor-pointer select-none
            hover:translate-y-2 hover:[box-shadow:0_0px_0_0_#193cb8,0_0px_0_0_#1b70f841]
            hover:border-b-[0px]
            transition-all duration-150 [box-shadow:0_10px_0_0_#193cb8,0_15px_0_0_#1b70f841]
            border-b-[1px] border-blue-400">
            <span class="flex flex-col justify-center items-center h-full text-white font-jaro text-xl">${i18n.t(
				"menu.home"
			)}</span>
          </div>
        </div>
      </div>
    `;
	}
	let canvas: HTMLCanvasElement = document.getElementById(
		"gameCanvas"
	) as HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("Failed to get 2D context");
	}

	let player1Score = 0;
	let player2Score = 0;

	let leftPaddle: Paddle = {
		x: 0,
		y: canvas.height / 2 - paddleHeight / 2,
		dy: 0,
	};

	let rightPaddle: Paddle = {
		x: canvas.width - 10,
		y: canvas.height / 2 - paddleHeight / 2,
		dy: 0,
	};

	let angle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
	if (Math.random() > 0.5) {
		angle += Math.PI;
	}
	let ball: Ball = {
		x: canvas.width / 2,
		y: canvas.height / 2,
		radius: ballRadius,
		dx: Math.cos(angle) * 3,
		dy: Math.sin(angle) * 3,
	};

	const savedThemeString = localStorage.getItem("selectedGamePalette");
	let gamePalette: gamePalette;

	if (savedThemeString) {
		try {
			gamePalette = JSON.parse(savedThemeString);
		} catch (e) {
			console.error(
				"Could not parse saved game palette, falling back to default:",
				e
			);
			gamePalette = {
				background: "#DDDDDD",
				paddle1: "#4F46E5",
				paddle2: "#DC2626",
				ball: "black",
				line: "rgba(0, 0, 0, 0.2)",
				score: "rgba(200, 200, 200, 0.7)",
			};
		}
	} else {
		gamePalette = {
			background: "#DDDDDD",
			paddle1: "#4F46E5",
			paddle2: "#DC2626",
			ball: "black",
			line: "rgba(0, 0, 0, 0.2)",
			score: "rgba(200, 200, 200, 0.7)",
		};
	}

	let lastBallX = 0;
	let lastBallY = 0;
	let lastBallDx = 0;
	let lastBallDy = 0;

	function saveGameState() {
		lastBallX = ball.x;
		lastBallY = ball.y;
		lastBallDx = ball.dx;
		lastBallDy = ball.dy;
	}

	function restoreGameState() {
		ball.x = lastBallX;
		ball.y = lastBallY;
		ball.dx = lastBallDx;
		ball.dy = lastBallDy;
	}

	document.addEventListener("keydown", (event) => {
		if (!isPaused) {
			if (event.key === "w") leftPaddle.dy = -paddleSpeed;
			if (event.key === "s") leftPaddle.dy = paddleSpeed;
			if (event.key === "ArrowUp") {
				event.preventDefault();
				rightPaddle.dy = -paddleSpeed;
			}
			if (event.key === "ArrowDown") {
				event.preventDefault();
				rightPaddle.dy = paddleSpeed;
			}
		}
	});

	document.addEventListener("keyup", (event) => {
		if (!isPaused) {
			if (event.key === "w" || event.key === "s") leftPaddle.dy = 0;
			if (event.key === "ArrowUp" || event.key === "ArrowDown") {
				event.preventDefault();
				rightPaddle.dy = 0;
			}
		}
	});

	document
		.getElementById("pauseLocalBtn")
		?.addEventListener("click", pauseGame);
	document.getElementById("btnHome")?.addEventListener("click", () => {
		history.pushState(null, "", "/menu");
		window.dispatchEvent(new PopStateEvent("popstate"));
	});

	function pauseGame() {
		isPaused = !isPaused;

		let pauseOverlay = document.getElementById("pauseOverlay");
		const btnHome = document.getElementById("btnHome");
		const btnPause = document.getElementById("pauseLocalBtn");

		if (!pauseOverlay) {
			pauseOverlay = document.createElement("div");
			pauseOverlay.id = "pauseOverlay";
			pauseOverlay.className =
				"absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-10 hidden";
			pauseOverlay.innerHTML = `
        <div class="text-white text-4xl font-bold mb-6 font-jaro">${i18n.t(
			"localGame.gamePaused"
		)}</div>
        <div id="resumeBtn" class="button h-14 w-40 bg-green-600 rounded-lg cursor-pointer select-none
          hover:translate-y-2 hover:[box-shadow:0_0px_0_0_#15803d,0_0px_0_0_#15803d41]
          hover:border-b-[0px]
          transition-all duration-150 [box-shadow:0_10px_0_0_#15803d,0_15px_0_0_#15803d41]
          border-b-[1px] border-green-400">
          <span class="flex flex-col justify-center items-center h-full text-white font-jaro text-xl">${i18n.t(
				"localGame.resume"
			)}</span>
        </div>
      `;

			const canvasContainer = document.querySelector("#canvas-box");
			if (canvasContainer) {
				canvasContainer.appendChild(pauseOverlay);
			}

			document
				.getElementById("resumeBtn")
				?.addEventListener("click", () => {
					pauseGame();
				});
		}

		if (isPaused) {
			if (btnHome && btnPause) {
				btnHome.classList.add("opacity-50", "pointer-events-none");
				btnPause.classList.add("opacity-50", "pointer-events-none");
			}
			pauseOverlay.classList.remove("hidden");
			const pauseBtn = document.getElementById("pauseLocalBtn");
			if (pauseBtn) {
				const pauseBtnText = pauseBtn.querySelector("span");
				if (pauseBtnText)
					pauseBtnText.textContent = i18n.t("localGame.resume");
			}
		} else {
			pauseOverlay.classList.add("hidden");
			if (btnHome && btnPause) {
				btnHome.classList.remove("opacity-50", "pointer-events-none");
				btnPause.classList.remove("opacity-50", "pointer-events-none");
			}
			const pauseBtn = document.getElementById("pauseLocalBtn");
			if (pauseBtn) {
				const pauseBtnText = pauseBtn.querySelector("span");
				if (pauseBtnText)
					pauseBtnText.textContent = i18n.t("localGame.pause");
			}
		}
	}

	function update() {
		leftPaddle.y += leftPaddle.dy;
		rightPaddle.y += rightPaddle.dy;

		leftPaddle.y = Math.max(
			0,
			Math.min(canvas.height - paddleHeight, leftPaddle.y)
		);
		rightPaddle.y = Math.max(
			0,
			Math.min(canvas.height - paddleHeight, rightPaddle.y)
		);

		if (ball.y - ball.radius <= 0) {
			ball.dy *= -1;
			ball.y += 3;
		} else if (ball.y + ball.radius >= canvas.height) {
			ball.dy *= -1;
			ball.y -= 3;
		}

		const SPEED_INCREASE = speedIncrease;

		if (
			ball.x - ball.radius <= leftPaddle.x + paddleWidth &&
			ball.y >= leftPaddle.y &&
			ball.y <= leftPaddle.y + paddleHeight
		) {
			let relativeIntersectY = ball.y - (leftPaddle.y + paddleHeight / 2);
			let normalizedIntersectY = relativeIntersectY / (paddleHeight / 2);

			ball.dx *= -1;
			ball.dy = normalizedIntersectY * Math.abs(ball.dx);
			ball.x += 2;

			ball.dx *= SPEED_INCREASE;
			ball.dy *= SPEED_INCREASE;
		}

		if (
			ball.x + ball.radius >= rightPaddle.x &&
			ball.y >= rightPaddle.y &&
			ball.y <= rightPaddle.y + paddleHeight
		) {
			let relativeIntersectY =
				ball.y - (rightPaddle.y + paddleHeight / 2);
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

			let angle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
			if (Math.random() > 0.5) {
				angle += Math.PI;
			}
			ball.dx = Math.cos(angle) * 3;
			ball.dy = Math.sin(angle) * 3;
			ball.radius = ballRadius;
		}
	}

	function draw() {
		const canvasWidth = canvas.width;
		const canvasHeight = canvas.height;

		if (ctx) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = gamePalette.background;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.beginPath();
			ctx.setLineDash([5, 5]);
			ctx.moveTo(canvasWidth / 2, 0);
			ctx.lineTo(canvasWidth / 2, canvasHeight);
			ctx.strokeStyle = gamePalette.line;
			ctx.lineWidth = 1;
			ctx.stroke();
			ctx.setLineDash([]);

			ctx.fillStyle = gamePalette.paddle1;
			ctx.fillRect(0, leftPaddle.y, paddleWidth, paddleHeight);

			ctx.fillStyle = gamePalette.paddle2;
			ctx.fillRect(
				canvasWidth - paddleWidth,
				rightPaddle.y,
				paddleWidth,
				paddleHeight
			);

			ctx.font = "bold 120px Arial";
			ctx.fillStyle = gamePalette.score;
			ctx.textAlign = "center";

			ctx.fillText(
				`${player1Score}`,
				canvasWidth / 4,
				canvasHeight / 2 + 40
			);

			ctx.fillText(
				`${player2Score}`,
				(canvasWidth / 4) * 3,
				canvasHeight / 2 + 40
			);

			ctx.beginPath();
			ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
			ctx.fillStyle = gamePalette.ball;
			ctx.fill();
			ctx.closePath();
		}
	}

	function loop() {
		if (!isPaused) {
			saveGameState();
			update();
		} else {
			restoreGameState();
		}

		draw();
		requestAnimationFrame(loop);
	}
	loop();
}
