import { fetchUserProfile } from "./mode";
import { matchmakingWebSocket } from "../wsClient";
import i18n from '../i18n';

export default function Home() {
    const app = document.getElementById('app');
	console.log("Module Home recharge");
    if (app) {
      app.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-screen">
          <h1 class="text-3xl font-bold text-blue-600 mb-4">${i18n.t('login.welcome')}</h1>
          <form id="loginForm" class="space-y-4">
            <input type="email" id="email" placeholder="${i18n.t('login.email')}" class="border border-blue-600 p-3 rounded text-blue-600 placeholder-blue-400" required />
            <input type="password" id="password" placeholder="${i18n.t('login.password')}" class="border border-blue-600 p-3 rounded text-blue-600 placeholder-blue-400" required />
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">${i18n.t('login.signIn')}</button>
          </form>
          <p class="mt-4">
            ${i18n.t('login.noAccount')} <a href="/signup" data-link class="text-indigo-600 hover:underline">${i18n.t('login.signUp')}</a>
          </p>
        </div>
      `;
      const loginForm = document.getElementById('loginForm') as HTMLFormElement;
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = (document.getElementById('email') as HTMLInputElement).value
		const password = (document.getElementById('password') as HTMLInputElement).value
        try {
          const baseUrl = window.location.origin;
          console.log(`${baseUrl}/user/login`);
          const response = await fetch(`${baseUrl}/user/login`, {
			  method: 'POST',
			  credentials: 'include',
			  headers: {
				'Content-Type': 'application/json'
			  },
			  body: JSON.stringify({ email, password })
			});
	
			if (!response.ok) {
			  throw new Error(`${i18n.t('login.connectionError')}: ${response.statusText}`);
			}
	
			const data = await response.json();
			console.log("Réponse de login:", data);
			//recup du userId
			const profile = await fetchUserProfile();
			if (profile && profile.userId) {
				matchmakingWebSocket(profile.userId);
			} else {
				console.error(i18n.t('login.profileError'));
			}
			history.pushState(null, '', '/menu');
			window.dispatchEvent(new PopStateEvent('popstate'));
		  } catch (error) {
			console.error(`${i18n.t('login.loginError')}:`, error);
		  }
      });
    }
}