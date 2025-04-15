// src/pages/Home.ts
import {  TournamentState } from "../types";
import { currentTournamentState } from "../wsClient";

console.log('[Tournament] Module chargé');

/*
function getAppContainer(): HTMLElement {
	const app = document.getElementById('app');
	if (!app) throw new Error('Element #app non trouvé');
	return app;
}*/


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
	const app = document.getElementById('app');
	if (!app) return;

	switch (state) {
		case 'tournament_queue':
			app.innerHTML = `<h2>En attente de joueurs...</h2>`;
			break;
		case 'tournament_launch':
			app.innerHTML = `
				<h2>Tournoi pret dans... 5, 4, 3,1, 1</h2>`;
			break;
		case 'match_1_start':
			app.innerHTML = `<h2>Lancer le match</h2>`;
			break;
		case 'match_2_start':
			app.innerHTML = `<h2>Match termine !</h2>`;
			break;
		case 'match_1_end':
			app.innerHTML = `<h2>Lancer le match</h2>`;
			break;
		case 'match_2_end':
			app.innerHTML = `<h2>Match termine !</h2>`;
			break;
		case 'final_wait':
			app.innerHTML = `<h2>En attente du deuxième finaliste...</h2>`;
			break;
		case 'final_prep':
			app.innerHTML = `<h2>En attente du deuxième finaliste...</h2>`;
			break;
		case 'final_start':
			app.innerHTML = `<h2>lancer la finale</h2>`;
			break;
		case 'final_end':
			app.innerHTML = `<h2>Partie terminée, résultats en cours...</h2>`;
			break;
		case 'tournament_victory_screen':
			app.innerHTML = `<h2>🎉 Félicitations ! Vous avez gagné le tournoi !</h2>`;
			break;
		case 'tournament_loser_screen':
			app.innerHTML = `<h2>Dommage ! Vous êtes éliminé du tournoi</h2>`;
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
					<button id="backToMenuBtn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Revenir au Menu</button>
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
