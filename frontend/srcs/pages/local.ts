// srcs/pages/local.ts

import { initGame } from './game-logics/local-logic';

export default function LocalGamePage() {
  const app = document.getElementById('app');
  if (app) {
    setTimeout(() => {
        initGame();
      }, 0);
  }
}