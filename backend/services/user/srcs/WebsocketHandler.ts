import { FastifyInstance, FastifyRequest } from "fastify";
import { WebSocket } from "ws";
import { updateUserStatus } from "./userDb.js";

interface JwtPayload {
	userId: string;
}

export const activeConnections: Map<string, WebSocket> = new Map();

async function authenticateWsConnection(
	fastify: FastifyInstance,
	token: string
): Promise<string | null> {
	try {
		const decoded = await fastify.jwt.verify<JwtPayload>(token);
		return decoded.userId;
	} catch (error) {
		console.error("WebSocket authentication error:", error);
		return null;
	}
}

export function handleWebSocketConnection(
	fastify: FastifyInstance,
	socket: WebSocket,
	req: FastifyRequest
) {
	console.log("New WebSocket connection attempt");

	const token = (req.query as any).token;

	if (!token) {
		console.log("WebSocket connection rejected: No token provided");
		socket.send(JSON.stringify({ error: "Authentication required " }));
		socket.close(1008, "Authentification required");
		return;
	}

	authenticateWsConnection(fastify, token).then((userId) => {
		if (!userId) {
			console.log("WebSocket connection rejected: Invalid token");
			socket.send(JSON.stringify({ error: "Authentication failed" }));
			socket.close(1008, "Authentication failed");
			return;
		}

		if (activeConnections.has(userId)) {
			socket.send(
				JSON.stringify({
					type: "error",
					code: "already_connected",
					message:
						"You are already connected from another device or browser",
				})
			);
			socket.close(4001, "Already connected");
			return;
		}

		console.log(`User ${userId} connected via WebSocket`);

		activeConnections.set(userId, socket);

		updateUserStatus(userId, "online");

		socket.send(
			JSON.stringify({
				type: "connection",
				status: "success",
				message: "Connected to WebSocket server",
			})
		);

		socket.on("close", () => {
			console.log(`User ${userId} disconnected from WebSocket`);
			activeConnections.delete(userId);
			updateUserStatus(userId, "offline");
		});

		socket.on("message", (message: Buffer) => {
			try {
				const data = JSON.parse(message.toString());

				if (data.type === "ping") {
					socket.send(JSON.stringify({ type: "pong" }));
				}
			} catch (error) {
				console.error("Error processing WebSocket message:", error);
			}
		});

		socket.on("error", (error: Error) => {
			console.error(`WebSocket error for user ${userId}:`, error);
			activeConnections.delete(userId);
			updateUserStatus(userId, "offline");
		});
	});
}

export function isUserConnected(userId: string): boolean {
	return activeConnections.has(userId);
}

export function getConnectedUsers(): string[] {
	return Array.from(activeConnections.keys());
}
