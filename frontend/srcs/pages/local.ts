// srcs/pages/local.ts

import { initGame } from './game-logics/local-logic';

export default function LocalGamePage() {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div class="flex flex-col items-center">
        <h1 class="text-3xl font-bold text-black p-2">Local Game</h1>
        <canvas id="gameCanvas" width="800" height="400" class="mx-auto block border-8 border-gray-500 bg-white-700"></canvas>
        <div class="mt-4 space-x-2">
          <button id="pauseLocalBtn" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Pause</button>
          <a href="/menu" data-link class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Home</a>
        </div>
      </div>
    `;

    document.getElementById('pauseLocalBtn')?.addEventListener('click', () => {
      alert("Game paused. Click OK to resume."); // Basic pause functionality
      // You can implement more sophisticated pause logic in local-game-logic.ts
    });

    // initGame();
    setTimeout(() => {
        initGame();
      }, 0);
  }
}