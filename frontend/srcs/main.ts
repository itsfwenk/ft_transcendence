import "./styles.css";
import { matchmakingWebSocket } from "./wsClient";
import "./i18n";
import { waitForI18n } from "./i18n";

console.log = () => {};
console.error = () => {};
console.warn = () => {};
console.info = () => {};
console.debug = () => {};

async function initApp() {
	try {
		await waitForI18n();

		const { initRouter } = await import("./router");
		initRouter();
	} catch (error) {
		console.error("❌ Erreur lors de l'initialisation:", error);
	}
}

initApp();

window.addEventListener("load", async () => {
	try {
		const baseUrl = window.location.origin;
		const currentPath = window.location.pathname;

		const response = await fetch(`${baseUrl}/user/status/userId`, {
			method: "GET",
			credentials: "include",
		});
		if (!response.ok) {
			history.pushState(null, "", "/");
			window.dispatchEvent(new PopStateEvent("popstate"));
		} else {
			const userId = localStorage.getItem("userId");
			if (userId) {
				matchmakingWebSocket(userId);
				if (currentPath === "/") {
					history.pushState(null, "", "/menu");
					window.dispatchEvent(new PopStateEvent("popstate"));
				}
			}
		}
	} catch (error) {
		console.log("No user logged in.");
	}
});
