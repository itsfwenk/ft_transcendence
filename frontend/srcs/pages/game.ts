// src/pages/Home.ts
export default function game() {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-screen">
			<h1 class="text-3xl font-bold text-blue-600 mb-4">Lancer la partie</h1>
          <form id="loginForm" class="space-y-4">
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">lancer</button>
          </form>
          <p class="mt-4">
          </p>
        </div>
      `;
      // Vous pouvez ajouter ici la logique pour le formulaire de login, par exemple:
      // const loginForm = document.getElementById('loginForm') as HTMLFormElement;
      // loginForm.addEventListener('submit', (e) => {
      //   e.preventDefault();
      //   // Implémentez votre logique d'authentification ici
      //   console.log("Connexion...");
      // });
    }
  }


// import { initGame, pauseGame } from './game-logics/local-logic.ts';

// export default function Game() {
//   const app = document.getElementById('app');
//   if (app) {
//     app.innerHTML = `
//       <div class="flex flex-col items-center">
//         <h1 class="text-3xl font-bold text-black p-2">Local Game</h1>
//         <canvas id="gameCanvas" width="800" height="400" class="mx-auto block border-8 border-gray-500 bg-white-700"></canvas>
//         <div class="mt-4 space-x-2">
//           <button id="pauseBtn" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Pause</button>
//           <a href="/" data-link class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Home</a>
//         </div>
//       </div>
//     `;

//     document.getElementById('pauseBtn')?.addEventListener('click', pauseGame);

//     initGame();
//   }
// }