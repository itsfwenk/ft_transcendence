interface Game {
	gameId: number;
	player1: string;
	player2: string;
	score1: number;
	score2: number;
	status: 'ongoing' | 'finished';
	winner?: string | null;
}

const games: Game[] = [];

export function saveGame(player1: string, player2: string): Game {
	const gameId = games.length + 1;
	const newGame: Game = { gameId, player1, player2, score1: 0, score2: 0, status: 'ongoing' };
	games.push(newGame);
	return newGame;
}

export function getGamebyId(gameId: number): Game | undefined {
	return games.find(g => g.gameId === gameId);
}