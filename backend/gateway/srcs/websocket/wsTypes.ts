import { WebsocketPluginOptions } from "@fastify/websocket";

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

