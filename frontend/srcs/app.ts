import { initGame, pauseGame } from './pages/game-logics/local-logic';
// import { pauseGame } from '../game.ts';
import game from './pages/game';

document.addEventListener('DOMContentLoaded', () => {
    // Define types for HTML elements
    const homePage = document.getElementById('homePage') as HTMLElement | null;
    const gamePage = document.getElementById('gamePage') as HTMLElement | null;
    const gameModeTitle = document.getElementById('gameMode') as HTMLElement | null;
    const localBtn = document.getElementById('localBtn') as HTMLButtonElement | null;
    const remoteBtn = document.getElementById('remoteBtn') as HTMLButtonElement | null;
    const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement | null;
    const homeBtn = document.getElementById('homeBtn') as HTMLButtonElement | null;
    const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement | null;
  
    // Function to show a specific page
    function showPage(page: HTMLElement | null): void {
      if (!homePage || !gamePage || !page) return;
      homePage.classList.add('hidden');
      gamePage.classList.add('hidden');
      page.classList.remove('hidden');
    }
  
    // Event listeners for navigation buttons
    localBtn?.addEventListener('click', () => {
      if (!gameModeTitle || !gameCanvas) return;
      gameModeTitle.textContent = 'Local Multiplayer';
      showPage(gamePage);
      // startLocalGame(gameCanvas);
      initGame();
    });
    
    remoteBtn?.addEventListener('click', () => {
      if (!gameModeTitle || !gameCanvas) return;
      gameModeTitle.textContent = 'Online Multiplayer';
      showPage(gamePage);
    //   startRemoteGame(gameCanvas);
      game();
    });
  
    pauseBtn?.addEventListener('click', () => {
      pauseGame();
    });
  
    homeBtn?.addEventListener('click', () => {
      showPage(homePage);
      // stopGame();
    });
  
    // Initially, show the home page
    showPage(homePage);
  });
  