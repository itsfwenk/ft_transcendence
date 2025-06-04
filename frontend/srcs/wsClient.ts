import { TournamentState } from "./types";
import { Tournament } from "./types";

let userSocket: WebSocket | null = null;
let matchmakingSocket: WebSocket | null = null;

export let currentTournamentState: TournamentState | null = null;
export let currentTournamentData: Tournament | null = null;

export function userWebSocket(userId: string): WebSocket {
	const baseUrl = window.location.origin.replace(/^https?:\/\//, "");
	const ws = new WebSocket(`wss://${baseUrl}/user/ws?playerId=${userId}`);
	ws.onopen = () => {
		console.log("Connexion WebSocket vers le service user établie");
	};
	ws.onmessage = (event) => {
		try {
			const msg = JSON.parse(event.data);
			console.log("Notification user WebSocket reçue:", msg);
			switch (msg.type) {
				case "userDisconnected":
					history.pushState(
						null,
						"",
						`/game?gameSessionId=${msg.gameSessionId}`
					);
					window.dispatchEvent(new PopStateEvent("popstate"));
					break;

				default:
					break;
			}
		} catch (error) {
			console.error("Erreur lors du parsing du message user:", error);
		}
	};

	ws.onerror = (error) => {
		console.error("Erreur WebSocket user:", error);
	};

	ws.onclose = () => {
		console.log("Connexion WebSocket user fermée");
	};
	userSocket = ws;
	return ws;
}

export function matchmakingWebSocket(userId: string): WebSocket {
	console.log("test_websocket", userId);
	const baseUrl = window.location.origin.replace(/^https?:\/\//, "");
	const ws = new WebSocket(
		`wss://${baseUrl}/matchmaking/ws?playerId=${userId}`
	);

	ws.addEventListener("open", () => console.log("[WS] open"));
	ws.addEventListener("close", () => console.log("[WS] closed"));
	ws.addEventListener("error", (e) => console.error("[WS] error", e));
	matchmakingSocket = ws;
	return ws;
}

export function getMatchmakingSocket(): WebSocket | null {
	return matchmakingSocket;
}
export function getUserSocket(): WebSocket | null {
	return userSocket;
}
