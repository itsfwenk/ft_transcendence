import {v4 as uuidv4} from 'uuid';
import { WSClient, WSClientId, RoomId, WSMessage } from './wsTypes';


const clients: Map<WSClientId, WSClient> = new Map();

const rooms: Map<RoomId, Set<WSClientId>> = new Map();

const userIdtoClientId: Map<string, WSClientId> = new Map();

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


