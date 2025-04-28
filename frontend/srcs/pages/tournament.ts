import {  TournamentState } from "../types";
import { currentTournamentState } from "../wsClient";

console.log('[Tournament] Module chargé');

export default function Tournament_mgt() {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-screen">
			<h1 class="text-3xl font-bold text-blue-600 mb-4">Lancer le tournoi</h1>
          <form id="loginForm" class="space-y-4">
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">lancer</button>
          </form>
          <p class="mt-4">
          </p>
        </div>
      `;
	if (currentTournamentState !== null) {
		console.log("currentState", currentTournamentState);
		updateTournamentUI(currentTournamentState);
	}
    }
	
}
export function updateTournamentUI(state: TournamentState) {
	console.log("updateTournamentState", state);
	const app = document.getElementById('app');
	if (!app) return;

	switch (state) {
		case 'tournament_launch':
			app.innerHTML = `
				<h2>Tournoi pret dans... 5, 4, 3,1, 1</h2>`;
			break;
		default:
			app.innerHTML = `<p>État du tournoi : ${state}</p>`;
			break;
	}
}



export function updatePlayerStateUI(state: string) {
	const app = document.getElementById('app');
	if (!app) return;
  
	switch (state) {
		case 'eliminated':
			app.innerHTML = `
				<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
					<h2 class="text-2xl font-bold mb-4">Dommage, vous êtes éliminé !</h2>
					<p class="text-gray-600">Vous pourrez retenter votre chance la prochaine fois.</p>
					<button id="backToMenuBtn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Revenir au Menu</button>
				</div>
			`;
		  break;
	  
		case 'waiting_next_round':
			app.innerHTML = `
				<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
					<h2 class="text-2xl font-bold mb-4">Félicitations, vous avez gagné ce match !</h2>
					<p class="text-gray-600">En attente du prochain tour...</p>
				</div>
			`;
		  break;
	  
		case 'winner':
			app.innerHTML = `
				<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
					<h2 class="text-2xl font-bold mb-4">Bravo, vous avez gagné le tournoi !</h2>
					<p class="text-gray-600">Vous êtes le champion. Félicitations&nbsp;!</p>
					<button id="backToMenuBtn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Revenir au Menu</button>
				</div>
			`;
		  break;
	  
		default:
			app.innerHTML = `
				<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
					<h2 class="text-2xl font-bold mb-4">Votre état joueur : ${state}</h2>
					<p class="text-gray-600">En attente d'informations supplémentaires.</p>
				</div>
			`;
	}
	const backToMenuBtn = document.getElementById('backToMenuBtn');
	backToMenuBtn?.addEventListener('click', () => {
		history.pushState(null, '', '/menu');
		window.dispatchEvent(new PopStateEvent('popstate'));
	});
  }
