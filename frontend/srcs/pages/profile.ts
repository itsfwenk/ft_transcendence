// src/pages/Profile.ts
export default function Profile() {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = /*html*/`
	  <div class="text-black font-jaro text-9xl mt-16 mb-36 select-none">Pong Game</div>

      `;
    }
  }