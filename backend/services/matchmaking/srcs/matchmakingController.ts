import { FastifyRequest, FastifyReply } from 'fastify';

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
	attemptMatch();
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
		}
		//call game service 
	}
}
