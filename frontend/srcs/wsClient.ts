
let socket: WebSocket | null = null;

export function connectWebSocket(userId: string): WebSocket {
	const ws = new WebSocket(`ws://localhost:4000/api-user/ws?playerId=${userId}`);
	
	ws.onopen = () => {
		console.log('Connexion WebSocket établie');
	};

	ws.onmessage = (event) => {
		try{
			const msg = JSON.parse(event.data);
			console.log('Notification WebSocket reçue:', msg);
			switch(msg.type) {
				case 'launch_game':
					history.pushState(null, '', `/game?gameSessionId=${msg.gameSessionId}`);
					window.dispatchEvent(new PopStateEvent('popstate'));
					break;
				case 'jointournament':
					break;
				default:
					break;
			}
		} catch (error) {
			console.error('Erreur lors du parsing du message:', error);
		}
	};
	
	ws.onerror = (error) => {
		console.error('Erreur WebSocket:', error);
	};
	
	ws.onclose = () => {
		console.log('Connexion WebSocket fermée');
	};

	return ws;
}

export function getWebSocket(): WebSocket | null {
	return socket;
}
