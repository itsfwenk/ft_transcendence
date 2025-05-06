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
	status: 'ongoing' | 'finished';
	winner_id?: string | null;
	matchId?: string | null;
	canvasWidth: number;
	canvasHeight: number;
}