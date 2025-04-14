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
