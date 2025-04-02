// src/pages/Home.ts
export default function Home() {
    const app = document.getElementById('app');
	console.log("Module Home recharge");
    if (app) {
      app.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-screen">
          <h1 class="text-3xl font-bold text-blue-600 mb-4">Bienvenue sur Pong Game</h1>
          <form id="loginForm" class="space-y-4">
            <input type="email" id="email" placeholder="Email" class="border border-blue-600 p-3 rounded text-blue-600 placeholder-blue-400" required />
            <input type="password" id="password" placeholder="Mot de passe" class="border border-blue-600 p-3 rounded text-blue-600 placeholder-blue-400" required />
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Se connecter</button>
          </form>
          <p class="mt-4">
            Pas de compte ? <a href="/signup" data-link class="text-indigo-600 hover:underline">Inscrivez-vous</a>
          </p>
        </div>
      `;
      const loginForm = document.getElementById('loginForm') as HTMLFormElement;
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = (document.getElementById('email') as HTMLInputElement).value
		const password = (document.getElementById('password') as HTMLInputElement).value
        try {

			const response = await fetch('https://api.yourdomain.com/api-user/login', {
			  method: 'POST',
			  credentials: 'include',
			  headers: {
				'Content-Type': 'application/json'
			  },
			  body: JSON.stringify({ email, password })
			});
	
			if (!response.ok) {
			  throw new Error(`Erreur lors de la connexion: ${response.statusText}`);
			}
	
			const data = await response.json();
			console.log("Réponse de login:", data);
			history.pushState(null, '', '/menu');
			window.dispatchEvent(new PopStateEvent('popstate'));
		  } catch (error) {
			console.error("Erreur de login:", error);
		  }
      });
    }
  }