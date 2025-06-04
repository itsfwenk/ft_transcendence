import { initGame } from "./pages/game-logics/local-logic";
import game from "./pages/game";

document.addEventListener("DOMContentLoaded", () => {
	const homePage = document.getElementById("homePage") as HTMLElement | null;
	const gamePage = document.getElementById("gamePage") as HTMLElement | null;
	const gameModeTitle = document.getElementById(
		"gameMode"
	) as HTMLElement | null;
	const localBtn = document.getElementById(
		"localBtn"
	) as HTMLButtonElement | null;
	const remoteBtn = document.getElementById(
		"remoteBtn"
	) as HTMLButtonElement | null;
	const homeBtn = document.getElementById(
		"homeBtn"
	) as HTMLButtonElement | null;
	const gameCanvas = document.getElementById(
		"gameCanvas"
	) as HTMLCanvasElement | null;

	function showPage(page: HTMLElement | null): void {
		if (!homePage || !gamePage || !page) return;
		homePage.classList.add("hidden");
		gamePage.classList.add("hidden");
		page.classList.remove("hidden");
	}

	localBtn?.addEventListener("click", () => {
		if (!gameModeTitle || !gameCanvas) return;
		gameModeTitle.textContent = "Local Multiplayer";
		showPage(gamePage);
		initGame();
	});

	remoteBtn?.addEventListener("click", () => {
		if (!gameModeTitle || !gameCanvas) return;
		gameModeTitle.textContent = "Online Multiplayer";
		showPage(gamePage);
		game();
	});

	homeBtn?.addEventListener("click", () => {
		showPage(homePage);
	});

	showPage(homePage);
});
