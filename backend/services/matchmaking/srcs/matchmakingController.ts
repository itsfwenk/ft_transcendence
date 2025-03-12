import { FastifyRequest, FastifyReply } from 'fastify';
import axios from 'axios';

// Interface pour les requêtes de création 
interface queueRequest extends FastifyRequest {
	body: {
	  userName: string;
	  email: string;
	  password: string;
	};
}

interface queueItem {
	playerId: number;
	joinTime: number;
	status?: 'matched' | 'waiting';
}

const queue: number[] = [];


//join 1v1 queue
export async function joinQueue(playerId: number) {
	queue.push(playerId);
	console.log(queue);
	attemptMatch();
}

export async function createGameSession(player1_id:number, player2_id:number) {
	try {
		const baseUrl = process.env.GAME_SERVICE_BASE_URL || 'http://game:4002';
		const response = await axios.post(`${baseUrl}/game/start`, {player1_id, player2_id});
		console.log('Partie creee:', response.data);
		return response.data.gameId;
	} catch (error) {
		console.error('Erreur lors du lancement de la partie:', error);
	}
}

// export function addPlayerQueue(playerId: number) {
// 	const newItem: queueItem = {
// 		playerId,
// 		joinTime: Date.now(),
// 		status: 'waiting',
// 	};
// 	matchmakingQueue.push(newItem);
// }
//status queue

//matchplayers

//join tournament queue

// removePlayer 
function attemptMatch() {
	if (queue.length >= 2) {
		const player1 = queue.shift();
		const player2 = queue.shift();
		if (player1 && player2) {
			console.log('creating a matching between')
			createGameSession(player1, player2)
		}
	}
}
