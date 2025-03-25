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
      const loginForm = document.getElementById('loginForm') as HTMLFormElement;
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Implémentez votre logique d'authentification ici
        console.log("Connexion...");
      });
    }
  }