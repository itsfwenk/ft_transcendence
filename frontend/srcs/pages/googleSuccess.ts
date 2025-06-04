import i18n from "../i18n";
import { fetchUserProfile } from "./mode";
import { matchmakingWebSocket } from "../wsClient";

export default async function loginSuccess() {
	const app = document.getElementById("app");
	if (app) {
		app.innerHTML = /*html*/ `
      <div class="flex flex-col items-center justify-center">
        <div class="text-black font-jaro text-6xl mt-16">${i18n.t(
			"login.googleSuccess"
		)}</div>
        <p class="text-black mt-8 font-jaro">${i18n.t(
			"login.googleSuccessMessage"
		)}</p>
        <div id="connectionStatus" class="text-black font-jaro mt-4">${i18n.t(
			"login.initializingConnection"
		)}</div>
      </div>
    `;

		const connectionStatus = document.getElementById("connectionStatus");

		try {
			if (connectionStatus) {
				connectionStatus.textContent = i18n.t("login.fetchingProfile");
			}

			const userProfile = await fetchUserProfile();

			if (!userProfile || !userProfile.userId) {
				throw new Error(i18n.t("login.profileFetchFailed"));
			}

			if (connectionStatus) {
				connectionStatus.textContent = i18n.t(
					"login.initializingWebSocket"
				);
			}

			localStorage.setItem("userId", userProfile.userId);

			matchmakingWebSocket(userProfile.userId);

			if (connectionStatus) {
				connectionStatus.textContent = i18n.t("login.redirectMessage");
			}

			setTimeout(() => {
				history.pushState(null, "", "/menu");
				window.dispatchEvent(new PopStateEvent("popstate"));
			}, 1500);
		} catch (error) {
			console.error(
				"Error during Google authentication initialization:",
				error
			);
			if (connectionStatus) {
				let errorMessage = "Unknown error";
				if (error instanceof Error) {
					errorMessage = error.message;
				} else if (typeof error === "string") {
					errorMessage = error;
				} else if (
					error &&
					typeof error === "object" &&
					"toString" in error
				) {
					errorMessage = error.toString();
				}

				connectionStatus.textContent = `${i18n.t(
					"login.connectionError"
				)}: ${errorMessage}`;
				connectionStatus.classList.add("text-red-500 font-jaro");
			}

			const retryButton = document.createElement("button");
			retryButton.textContent = i18n.t("login.retry");
			retryButton.className =
				"mt-4 px-4 py-2 bg-blue-600 text-white font-jaro rounded hover:bg-blue-700";
			retryButton.onclick = () => {
				history.pushState(null, "", "/");
				window.dispatchEvent(new PopStateEvent("popstate"));
			};
			app.appendChild(retryButton);
		}
	}
}
