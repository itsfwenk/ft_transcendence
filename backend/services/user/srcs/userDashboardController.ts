import { FastifyRequest, FastifyReply } from "fastify";
import { getUserById } from "./userDb";
import fetch from "node-fetch";

interface MatchHistoryItem {
	gameId: string;
	gameType: string;
	opponent: {
		userId: string;
	};
	result: "win" | "loss";
	score: {
		player: number;
		opponent: number;
	};
	date: string;
	tournament_Id: string | null;
}

interface UserDashboard {
	user: {
		userName: string;
		email: string;
		status: string;
		avatarUrl: string;
		userId: string; // Ajouté pour faciliter l'accès direct à l'avatar
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
		result: "win" | "loss";
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

export async function getUserDashboard(
	req: AuthenticatedRequest,
	reply: FastifyReply
) {
	try {
		const userId = req.user.userId;

		const user = getUserById(userId);
		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}

		const dashboardBase: UserDashboard = {
			user: {
				userName: user.userName,
				email: user.email,
				status: user.status,
				avatarUrl: user.avatarUrl,
				userId: user.userId,
			},
			stats: {
				totalGames: 0,
				wins: 0,
				losses: 0,
				winRate: 0,
			},
			matchHistory: [],
		};

		try {
			const matchmakingServiceUrl =
				process.env.MATCHMAKING_SERVICE_BASE_URL;

			if (!matchmakingServiceUrl) {
				console.warn("MATCHMAKING_SERVICE_BASE_URL is not defined");
				return reply.send(dashboardBase);
			}

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes timeout

			const matchHistoryResponse = await fetch(
				`${matchmakingServiceUrl}/matchmaking/history/${userId}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Cookie: req.headers.cookie || "", // credentials ne fonctionne pas avec node-fetch v2
					},
					signal: controller.signal,
				}
			);

			clearTimeout(timeoutId);

			if (!matchHistoryResponse.ok) {
				console.warn(
					`Failed to fetch match history: ${matchHistoryResponse.statusText}`
				);
				return reply.send(dashboardBase);
			}

			const matchHistory =
				(await matchHistoryResponse.json()) as MatchHistoryItem[];

			const enrichedMatchHistory = await Promise.all(
				matchHistory.map(async (match) => {
					const opponentId = match.opponent.userId;
					const opponent = getUserById(opponentId);

					return {
						...match,
						opponent: {
							userId: opponentId,
							userName: opponent
								? opponent.userName
								: "Unknown User",
						},
					};
				})
			);

			const totalGames = enrichedMatchHistory.length;
			const wins = enrichedMatchHistory.filter(
				(match: { result: string }) => match.result === "win"
			).length;
			const losses = totalGames - wins;
			const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

			const dashboard: UserDashboard = {
				user: {
					userName: user.userName,
					email: user.email,
					status: user.status,
					avatarUrl: user.avatarUrl,
					userId: user.userId,
				},
				stats: {
					totalGames,
					wins,
					losses,
					winRate,
				},
				matchHistory: enrichedMatchHistory,
			};

			return reply.send(dashboard);
		} catch (error) {
			console.error("Error fetching match history:", error);
			return reply.send(dashboardBase);
		}
	} catch (error) {
		console.error("Error generating user dashboard:", error);
		return reply.status(500).send({ error: "Internal server error" });
	}
}
