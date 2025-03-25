// src/pages/Profile.ts
export default function Profile() {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div class="p-4">
          <h1 class="text-2xl font-bold">Mon Profil</h1>
          <!-- Contenu du profil ici -->
          <p>Information sur l'utilisateur...</p>
          <a href="/menu" data-link class="text-indigo-600 hover:underline">Retour au menu principal</a>
        </div>
      `;
    }
  }