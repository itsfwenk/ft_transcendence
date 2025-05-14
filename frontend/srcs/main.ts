import './styles.css'
import { initRouter } from './router';
import { matchmakingWebSocket } from "./wsClient";
import { handleDisconnect } from './pages/menu';
// import { fetchUserProfile } from './pages/mode';


initRouter();

window.addEventListener('beforeunload', () => {
    handleDisconnect()
});

window.addEventListener("load", async () => {
	try {
			const baseUrl = window.location.origin;
			// const currentPath = window.location.pathname;

			// if (currentPath === '/') {
			// return;
			// }
			const response = await fetch(`${baseUrl}/user/status/userId`, {
		  		method: 'GET',
		  		credentials: 'include',
			});
			  if (!response.ok) {
				history.pushState(null, '', '/');
				window.dispatchEvent(new PopStateEvent('popstate'));
			} else {
				const userId = localStorage.getItem("userId");
				if (userId) {
					matchmakingWebSocket(userId);
				}
			}
	}
	catch (error) {
		console.log("No user logged in.");
	}
});