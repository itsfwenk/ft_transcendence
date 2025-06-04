import { fetchUserProfile } from "./mode";
import { getMatchmakingSocket } from "../wsClient";
import { getAvatarUrl } from "./profile";
import i18n from "../i18n";

let matchPrepTournament = false;
let currentGameIdTournament: string | null = null;

export default async function Queuetournament() {
	const app = document.getElementById("app");
	if (!app) return;

	const userProfile = await fetchUserProfile();
	console.log(userProfile);
	if (!userProfile) {
		console.error(i18n.t("profile.noUserConnected"));
		return;
	}
	const currentPlayerId = userProfile.userId;
	console.log(`${i18n.t("profile.currentPlayerId")}:`, currentPlayerId);

	const currentPlayerAvatar = getAvatarUrl(currentPlayerId);
	console.log(
		`${i18n.t("profile.currentPlayerAvatar")}:`,
		currentPlayerAvatar
	);

	app.innerHTML = /*html*/ `
	<div class="text-black font-jaro text-9xl mt-16 mb-36 select-none">${i18n.t(
		"general.pongGame"
	)}</div>
    <div class="flex flex-col items-center justify-center">
      <div class="flex flex-col items-center justify-center w-1/3 bg-blue-700 rounded-md">
      <h1 class="text-6xl mb-9 pt-2 font-jaro">${i18n.t(
			"tournament.title"
		)}</h1>
      <div id="queue-list" class="flex flex-wrap justify-center gap-3">
	  
	  
      </div>
      <p id="status-message" class="text-white font-inria font-bold pt-5 m-5">${i18n.t(
			"queue.searchingOpponents"
		)}</p>
      </div>
      <div id="backBtn" class='button w-24 h-13 mt-10 bg-gray-700 rounded-full cursor-pointer select-none
      hover:translate-y-2 hover:[box-shadow:0_0px_0_0_#000000,0_0px_0_0_#00000041]
      hover:border-b-[0px]
      transition-all duration-150 [box-shadow:0_10px_0_0_#000000,0_15px_0_0_#00000041]
      border-b-[1px] border-gray-400'>
      <span class='flex flex-col justify-center items-center h-full text-white font-jaro'>${i18n.t(
			"general.back"
		)}</span>
      </div>
    </div>
  `;

	const queueList = document.getElementById("queue-list")!;
	for (let i = 0; i < 4; i++) {
		queueList.insertAdjacentHTML(
			"beforeend",
			`<div class="slot w-16 h-16 bg-white rounded-md cube-3d overflow-hidden"
				data-filled="false"></div>`
		);
	}
	type QueuePlayer = { userId: string; userName: string; avatarUrl: string };

	const slots = Array.from(
		document.querySelectorAll<HTMLDivElement>("#queue-list .slot")
	);
	const DEFAULT_AVATAR = "/avatars/default.png";
	function addPlayerToSlot(p: QueuePlayer) {
		if (document.querySelector(`[data-user-id="${p.userId}"]`)) return;

		const slot = slots.find((s) => s.dataset.filled === "false");
		if (!slot) return;

		slot.dataset.filled = "true";
		slot.dataset.userId = p.userId;
		console.log("p.avatarUrl", p.avatarUrl);
		slot.innerHTML = `
			<img src="${p.avatarUrl || DEFAULT_AVATAR}"
         alt="${p.userName}"
         class="w-full h-full object-cover"
         onerror="this.onerror=null; this.src='${DEFAULT_AVATAR}'" />`;
	}

	function removePlayerFromSlot(userId: string) {
		const slot = document.querySelector<HTMLDivElement>(
			`.slot[data-user-id="${userId}"]`
		);
		if (!slot) return;

		slot.dataset.filled = "false";
		slot.removeAttribute("data-user-id");
		slot.innerHTML = "";
	}

	let countdownHandle: number | null = null;
	let time = Number(import.meta.env.VITE_TOURNAMENT_LAUNCH_DELAY ?? "5");

	function startCountdown(delay: number, cb: () => void) {
		const statusMessage = document.getElementById("status-message");

		if (countdownHandle) clearInterval(countdownHandle);
		let seconds = delay > 0 ? delay : 5;
		if (statusMessage) {
			statusMessage.textContent = i18n.t("tournament.startsIn") + seconds;
		}

		if (backBtn) backBtn.classList.add("hidden");
		countdownHandle = window.setInterval(() => {
			seconds--;
			if (seconds > 0 && statusMessage) {
				statusMessage.textContent =
					i18n.t("tournament.startsIn") + seconds;
			} else {
				clearInterval(countdownHandle!);
				countdownHandle = null;
				cb();
			}
		}, 1000);
	}

	function cancelCountdown() {
		if (countdownHandle) clearInterval(countdownHandle);
		countdownHandle = null;
		document.getElementById("tournament-timer")?.classList.add("hidden");
	}

	function showError(messageKey: string) {
		const app = document.getElementById("app");
		if (!app) return;

		app.innerHTML = /*html*/ `
			<div class="min-h-screen flex flex-col items-center justify-center bg-white text-black">
			<p class="text-xl mb-6">${i18n.t(messageKey)}</p>
			<button id="backBtn"
					class="px-5 py-2 bg-gray-700 text-white rounded">
				${i18n.t("general.back")}
			</button>
			</div>
		`;

		document.getElementById("backBtn")?.addEventListener("click", () => {
			history.pushState(null, "", "/mode");
			window.dispatchEvent(new PopStateEvent("popstate"));
		});
	}

	const ws = getMatchmakingSocket();
	if (!ws) {
		showError(i18n.t("gameMode.socketNotConnected"));
		return;
	}

	function initQueueSocket() {
		if (!ws) return;
		ws.onmessage = handleMessageTournament;

		ws.send(
			JSON.stringify({ action: "QUEUE_JOIN_TOURNAMENT", payload: {} })
		);
	}
	if (ws.readyState === WebSocket.OPEN) {
		initQueueSocket();
	} else {
		ws.addEventListener("open", initQueueSocket, { once: true });
	}
	ws.removeEventListener("message", handleMessageTournament);

	function cleanupMatchmaking() {
		if (ws && ws.readyState === WebSocket.OPEN) {
			console.log(i18n.t("tournament.cleanupMatchmaking"));
			ws.removeEventListener("message", handleMessageTournament);
			ws.removeEventListener("beforeunload", handlePageUnload);
			cancelCountdown();
		}
	}

	addPlayerToSlot({
		userId: currentPlayerId,
		userName: userProfile.userName ?? i18n.t("queue.you"),
		avatarUrl: currentPlayerAvatar,
	});
	async function handleMessageTournament(event: MessageEvent) {
		try {
			const msg = JSON.parse(event.data);
			console.log(`${i18n.t("queue.messageReceived")}:`, msg);

			switch (msg.type) {
				case "QUEUE_TOURNAMENT_PLAYER_JOINED":
					const list = msg.players as QueuePlayer[];
					list.forEach((p) =>
						addPlayerToSlot({
							userId: p.userId,
							userName: p.userName ?? i18n.t("queue.opponent"),
							avatarUrl: getAvatarUrl(p.userId),
						})
					);
					break;
				case "QUEUE_TOURNAMENT_PLAYER_LEFT":
					removePlayerFromSlot(msg.playerId as string);
					break;
				case "MATCH_PREP":
					matchPrepTournament = true;
					currentGameIdTournament = msg.payload.gameSessionId;
					console.log("currentGameID", currentGameIdTournament);
					const round = msg.payload.round;
					if (round === 2) {
						history.pushState(
							null,
							"",
							`/game?gameSessionId=${currentGameIdTournament}`
						);
						window.dispatchEvent(new PopStateEvent("popstate"));
					} else {
						startCountdown(time, () => {
							history.pushState(
								null,
								"",
								`/game?gameSessionId=${currentGameIdTournament}`
							);
							window.dispatchEvent(new PopStateEvent("popstate"));
						});
					}
					break;
				case "OPPONENT_FORFEIT":
					cleanupMatchmaking();
					history.pushState(
						null,
						"",
						`/game?gameSessionId=${currentGameIdTournament}`
					);
					window.dispatchEvent(new PopStateEvent("popstate"));
					break;
			}
		} catch (error) {
			console.error(`${i18n.t("queue.errorProcessingMessage")}:`, error);
		}
	}

	const handlePageUnload = () => {
		if (ws && ws.readyState === WebSocket.OPEN) {
			if (!matchPrepTournament) {
				ws.send(
					JSON.stringify({
						action: "QUEUE_LEAVE_TOURNAMENT",
						payload: { playerId: currentPlayerId },
					})
				);
			} else {
				ws.send(
					JSON.stringify({
						action: "MATCH_PREP_FORFEIT",
						payload: {
							playerId: currentPlayerId,
							gameSessionId: currentGameIdTournament,
						},
					})
				);
			}
		}
		cleanupMatchmaking();
	};

	window.addEventListener("beforeunload", handlePageUnload);

	const backBtn = document.getElementById("backBtn");
	backBtn?.addEventListener("click", () => {
		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.send(
				JSON.stringify({
					action: "QUEUE_LEAVE_TOURNAMENT",
					payload: { playerId: currentPlayerId },
				})
			);
		}
		cleanupMatchmaking();
		history.pushState(null, "", "/mode");
		window.dispatchEvent(new PopStateEvent("popstate"));
	});
}
