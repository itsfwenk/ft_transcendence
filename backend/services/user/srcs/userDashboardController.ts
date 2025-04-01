import { FastifyRequest, FastifyReply } from "fastify";
import { getUserById } from "./userDb";
import fetch from "node-fetch";

interface MatchHistoryItem {
	gameId: string;
	gameType: string;
	opponent: {
	  userId: string;
	};
	result: 'win' | 'loss';
	score: {
	  player: number;
	  opponent: number;
	};
	date: string;
	tournamentId: string | null;
}

interface UserDashboard {
	user: {
		userName: string;
		email: string;
		status: string;
		avatarUrl: string;
	  };
	  stats: {
		totalGames: number;
		wins: number;
		losses: number;
		winRate: number;
	  };
	  matchHistory: Array<{
		gameId: string;
		gameType: string;
		opponent: {
		  userId: string;
		  userName: string;
		};
		result: 'win' | 'loss';
		score: {
		  player: number;
		  opponent: number;
		};
		date: string;
		}>;
}

interface AuthenticatedRequest extends FastifyRequest {
	user: { userId: string };
}

export async function getUserDashboard(req: AuthenticatedRequest, reply: FastifyReply) {
	try {
		const userId = req.user.userId;

		const user = getUserById(userId);
		if (!user) {
			return reply.status(404).send({ error: 'User not found' });
		}

		try {
			const matchmakingServiceUrl = process.env.MATCHMAKING_SERVICE_BASE_URL;
			const matchHistoryResponse = await fetch(`${matchmakingServiceUrl}/matchmaking/history/${userId}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Cookie': req.headers.cookie || '' // credentials ne fonctionne pas avec node-fetch v2
				}
			});

			if (!matchHistoryResponse.ok) {
				throw new Error(`Failed to fetch match history: ${matchHistoryResponse.statusText}`);
			}

			const matchHistory = await matchHistoryResponse.json() as MatchHistoryItem[];

			const enrichedMatchHistory = await Promise.all(matchHistory.map(async (match) => {
				const opponentId = match.opponent.userId;
				const opponent = getUserById(opponentId);

				return {
					...match,
					opponent: {
						userId: opponentId,
						userName: opponent ? opponent.userName : 'Unknown User'
					}
				};
			}));

			const totalGames = enrichedMatchHistory.length;
			const wins = enrichedMatchHistory.filter((match: {result: string}) => match.result === 'win').length;
			const losses = totalGames - wins;
			const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

			const dashboard: UserDashboard = {
				user: {
					userName: user.userName,
					email: user.email,
					status:user.status,
					avatarUrl: user.avatarUrl
				},
				stats: {
					totalGames,
					wins,
					losses,
					winRate
				},
				matchHistory: enrichedMatchHistory
			};
		
			return reply.send(dashboard);

		} catch (error) {
			console.error('Error fetching math history:', error);
			return reply.send({
				user: {
					userName: user.userName,
					email: user.email,
					status:user.status,
					avatarUrl: user.avatarUrl
				},
				stats: {
					totalGames: 0,
					wins: 0,
					losses: 0,
					winRate: 0
				},
				matchHistory: [],
				error: 'Failed to fetch match history, matchmaking service unavaible'
			});
		}
	} catch (error) {
		console.error('Error generating user dashboard:', error);
		return reply.status(500).send({ error: 'Internal server error' });
	}
}