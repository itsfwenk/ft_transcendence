import './styles.css'
import { initRouter } from './router';
import { matchmakingWebSocket } from "./wsClient";
// import { handleDisconnect } from './pages/menu'


initRouter();

// window.addEventListener('beforeunload', () => {
//     handleDisconnect()
// });

window.addEventListener("load", () => {
	const userId = localStorage.getItem("userId");
	if (userId) {
		matchmakingWebSocket(userId);
	}
});
