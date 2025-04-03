
let userSocket: WebSocket | null = null;
let matchmakingSocket: WebSocket | null = null;

export function userWebSocket(userId: string): WebSocket {
	const ws = new WebSocket(`ws://localhost:4000/api-user/ws?playerId=${userId}`);
	ws.onopen = () => {
		console.log('Connexion WebSocket vers le service user établie');
	};

	ws.onmessage = (event) => {
		try{
			const msg = JSON.parse(event.data);
			console.log('Notification user WebSocket reçue:', msg);
			switch(msg.type) {
				case 'userDisconnected':
					history.pushState(null, '', `/game?gameSessionId=${msg.gameSessionId}`);
					window.dispatchEvent(new PopStateEvent('popstate'));
					break;
				case 'jointournament':
					break;
				default:
					break;
			}
		} catch (error) {
			console.error('Erreur lors du parsing du message user:', error);
		}
	};
	
	ws.onerror = (error) => {
		console.error('Erreur WebSocket user:', error);
	};
	
	ws.onclose = () => {
		console.log('Connexion WebSocket user fermée');
	};
	userSocket = ws;
	return ws;
}

export function matchmakingWebSocket(userId: string): WebSocket {
	const ws = new WebSocket(`ws://localhost:4000/api-matchmaking/ws?playerId=${userId}`);
	ws.onopen = () => {
		console.log('Connexion WebSocket matchmaking établie');
	};

	ws.onmessage = (event) => {
		try{
			const msg = JSON.parse(event.data);
			console.log('Notification WebSocket matchmaking reçue:', msg);
			switch(msg.type) {
				case 'join_1v1':
					history.pushState(null, '', `/game?gameSessionId=${msg.gameSessionId}`);
					window.dispatchEvent(new PopStateEvent('popstate'));
					break;
				case 'jointournament':
					break;
				default:
					break;
			}
		} catch (error) {
			console.error('Erreur lors du parsing du message matchmaking:', error);
		}
	};
	
	ws.onerror = (error) => {
		console.error('Erreur WebSocket matchmaking:', error);
	};
	
	ws.onclose = () => {
		console.log('Connexion WebSocket matchmaking fermée');
	};
	matchmakingSocket = ws;
	return ws;
}


export function getMatchmakingSocket(): WebSocket | null {
	return matchmakingSocket;
}
  
  export function getUserSocket(): WebSocket | null {
	return userSocket;
  }
