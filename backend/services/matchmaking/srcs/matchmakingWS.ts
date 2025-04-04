/*
import {v4 as uuidv4} from 'uuid';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { WebSocket } from "ws";
import { handleMatchmakingMessage } from './matchmakingController';

export type WSClientId = string;
export type RoomId = string;

export interface WSClient {
	id: WSClientId;
	userId: string;
	connection: WebSocket;
	rooms: Set<RoomId>;
}

export type WSMessage = {
	type: string;
	payload: any;
};

export interface MatchmakingEvents {
	joinQueue1v1: { userId: string};
	leaveQueue: {userId: string };
}

export const clients: Map<WSClientId, WSClient> = new Map();

export const rooms: Map<RoomId, Set<WSClientId>> = new Map();

export const userIdtoClientId: Map<string, WSClientId> = new Map();

export function registerMatchmakingWS(fastify: FastifyInstance) {
	console.log("[MM] Route /matchmaking/ws appelée");
	fastify.get('/matchmaking/ws', { websocket: true }, (connection: WebSocket, request: FastifyRequest) => {
		const { playerId } = request.query as { playerId?: string };
		console.log('Query params:', request.query);
		if (!playerId) {
			console.error("playerId non fourni, fermeture de la connexion");
			connection.close();
			return;
		}

		 // Vérifier si une connexion existe déjà pour ce playerId
		if (websocketClients.has(playerId)) {
			console.warn(`Une connexion existe déjà pour le playerId: ${playerId}. Fermeture de la nouvelle connexion.`);
			connection.close();
			return;
		}

		connection.on('message', (raw) => {
			try {
				const msg = JSON.parse(raw.toString());
				handleMatchmakingMessage(msg, playerId, websocketClients);
			} catch (err) {
				console.error('Message JSON invalide :', err);
			}
		});
		console.log(`Un client WebSocket est connecté pour le playerId: ${playerId}`);
		// Stocker la connexion dans la Map avec le playerId comme clé
		websocketClients.set(playerId, connection);
	  
		connection.on('close', () => {
			console.log(`Un client WebSocket s'est déconnecté pour le playerId: ${playerId}`);
			websocketClients.delete(playerId);
		});
	});
}




export const addClient = (connection: WebSocket, userId: string): WSClient => {
	const clientId = uuidv4();
	const client: WSClient = {
		id: clientId,
		userId,
		connection,
		rooms: new Set()
	};
	clients.set(clientId, client);
	userIdtoClientId.set(userId, clientId);
	return(client);
};

export const removeClient = (clientId: WSClientId): void => {
	const client = clients.get(clientId);
	if (!client) 
		return ;
	client.rooms.forEach(roomId => {
		leaveRoom(clientId, roomId);
	});
	userIdtoClientId.delete(client.userId);
	clients.delete(clientId);
};


export const getClient = (clientId: WSClientId): WSClient | undefined => {
	return clients.get(clientId);
}

export const getClientByUserId = (userId: string): WSClient | undefined => {
	const clientId = userIdtoClientId.get(userId);
	if (!clientId) return undefined;
	return clients.get(clientId);
}

export const createRoom = (roomId: RoomId): void => {
	if (!rooms.has(roomId)) {
		rooms.set(roomId, new Set());
	}
};

export const joinRoom = (clientId: WSClientId, roomId: RoomId): void => {
	const client = clients.get(clientId);
	if (!client)
		return;
	if (!rooms.has(roomId))
		createRoom(roomId);
	rooms.get(roomId)?.add(clientId);
	client.rooms.add(roomId);
};

export const leaveRoom = (clientId: WSClientId, roomId: RoomId): void => {
	const client = clients.get(clientId);
	if (!client)
		return;
	if (!rooms.has(roomId))
		return;
	rooms.get(roomId)?.delete(clientId);
	if (rooms.get(roomId)?.size === 0) {
		rooms.delete(roomId);
	}
	client.rooms.delete(roomId);
};

export const sendToClient = (clientId: WSClientId, message: WSMessage): void => {
	const client = clients.get(clientId);
	if (!client) return;

	try {
		client.connection.send(JSON.stringify(message));
	} catch (error) {
		console.error(`Error sending message to client ${clientId}:`, error);
	}
};

export const sendToUser = (userId: string, message: WSMessage): void => {
	const clientId = userIdtoClientId.get(userId);
	if (!clientId) return;
	sendToClient(clientId, message);
};

export const sendToRoom = (roomId: RoomId, message: WSMessage): void => {
	const clientIds = rooms.get(roomId);
	if (!clientIds) return;
	clientIds.forEach(clientId => {
		sendToClient(clientId, message);
	});
};

export const sendToUsers = (userIds: string[], message: WSMessage): void => {
	userIds.forEach(userId => {
		sendToUser(userId, message);
	});
};

export const createMatchRoom = (matchId: string, userIds: string[]): string => {
	const roomId = `match:${matchId}`;
	createRoom(roomId);
	userIds.forEach(userId => {
		const clientId = userIdtoClientId.get(userId);
		if (clientId) {
			joinRoom(clientId, roomId);
		}
	});
	return roomId;
};

export const createTournamentRoom = (tournamentId: string, userIds: string[]): string => {
	const roomId = `tournament:${tournamentId}`;
	createRoom(roomId);
	userIds.forEach(userId => {
		const clientId = userIdtoClientId.get(userId);
		if (clientId) {
			joinRoom(clientId, roomId);
		}
	});
	return roomId;
}

export const getAllClients = (): WSClient[] => {
	return Array.from(clients.values());
};

export const getRoomClients = (roomId: RoomId): WSClient[] => {
	const clientIds = rooms.get(roomId);
	if (!clientIds) return [];

	return Array.from(clientIds)
		.map(clientId => clients.get(clientId))
		.filter((client): client is WSClient => client !== undefined);
}


*/