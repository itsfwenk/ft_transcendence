import { matchmakingWebSocket } from "../wsClient";
import { fetchUserProfile } from "./mode";

export default function login() {
	const app = document.getElementById('app');
	if (app) {
	  app.innerHTML = /*html*/`
		<div class="text-black font-jaro text-9xl mt-16">Pong Game</div>
		<form id="loginForm" class="flex">
			<input type="email" id="email" name="email" placeholder="email" required class="mt-44 ml-78 block px-3 py-2 bg-white border border-black text-black rounded-md focus:outline-none">
			<input type="password" id="password" name="password" placeholder="password" required class="mt-44 ml-6 block px-3 py-2 bg-white border border-black text-black rounded-md focus:outline-none">
			<button type="submit" class="font-inria px-6 py-2 mr-80 mt-44 ml-6 border border-black rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 hover:outline-none focus:outline-none">login</button>
		</form>
		<div id="errorMessage" class="text-red-500 mt-2 hidden">Erreur de connexion. Vérifiez vos identifiants.</div>
		<hr class="mx-auto my-10 border-black w-1/4">
		<button id="createAccountBtn" type="button" class="font-inria w-1/2 border-black rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 hover:outline-none focus:outline-none">Create account</button>
		<div class="text-black my-4">or</div>
		<button id="googleLoginBtn" type="button" class="font-inria w-1/2 border border-black rounded-md font-medium text-white bg-red-500 hover:bg-red-600 hover:outline-none focus:outline-none">Google</button>
	  `;

      const loginForm = document.getElementById('loginForm') as HTMLFormElement;
      const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
      
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        errorMessage.classList.add('hidden');
        
        const email = (document.getElementById('email') as HTMLInputElement).value;
		const password = (document.getElementById('password') as HTMLInputElement).value;
        
        try {
			const baseUrl = window.location.origin;
			const response = await fetch(`${baseUrl}/user/login`, {
			  method: 'POST',
			  credentials: 'include',
			  headers: {
				'Content-Type': 'application/json'
			  },
			  body: JSON.stringify({ email, password })
			});
	
			if (!response.ok) {
			  throw new Error('Échec de connexion');
			}
	
			const data = await response.json();
			console.log("Réponse de login:", data);
			//recup du userId
			const profile = await fetchUserProfile();
			if (profile && profile.userId) {
				matchmakingWebSocket(profile.userId);
			} else {
				console.error ('Impossible de recuperer le profile du user');
			}
			history.pushState(null, '', '/menu');
			window.dispatchEvent(new PopStateEvent('popstate'));
		} catch (error) {
			console.error("Erreur de login:", error);
			
			errorMessage.classList.remove('hidden');
		}
      });

	  const createAccountBtn = document.getElementById('createAccountBtn');
	  createAccountBtn?.addEventListener('click', () => {
		history.pushState(null, '', '/create_account');
		window.dispatchEvent(new PopStateEvent('popstate'));
	  });

	  const googleLoginBtn = document.getElementById('googleLoginBtn');
	  googleLoginBtn?.addEventListener('click', () => {
		window.location.href = 'http://localhost:4000/api-user/auth/google';
	  });
	}
  }