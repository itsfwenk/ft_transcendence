// src/pages/Home.ts
export default function Home() {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-screen">
          <h1 class="text-3xl font-bold mb-4">Bienvenue sur Pong Game</h1>
          <form id="loginForm" class="space-y-4">
            <input type="email" id="email" placeholder="Email" class="border p-2 rounded" required />
            <input type="password" id="password" placeholder="Mot de passe" class="border p-2 rounded" required />
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Se connecter</button>
          </form>
          <p class="mt-4">
            Pas de compte ? <a href="/signup" data-link class="text-indigo-600 hover:underline">Inscrivez-vous</a>
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