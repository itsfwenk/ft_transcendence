import { matchmakingWebSocket } from "../wsClient";
import { fetchUserProfile } from "./mode";
import i18n from '../i18n';

export default async function login() {
	const baseUrl = window.location.origin;
	// try {
	// 	console.log("Looking for session");
	// 	const baseUrl = window.location.origin;
	// 	console.log("in login first check fetching at :", `${baseUrl}/user/status/userId`);
	// 	const response = await fetch(`${baseUrl}/user/status/userId`, {
	// 	  method: 'GET',
	// 	  credentials: 'include',
	// 	});
	// 	if (response.ok) {
	// 		// const profile = await fetchUserProfile();
	// 		// if (profile && profile.userId) {
	// 		// 	matchmakingWebSocket(profile.userId);
	// 		// } else {
	// 		// 	console.error ('Impossible de recuperer le profile du user');
	// 		// }

	// 		const data = await response.text();
	// 		console.log("Session found:", data);
	// 		history.pushState(null, '', '/menu');
	// 		window.dispatchEvent(new PopStateEvent('popstate'));
	// 		return;
	// 	}
	// }
	// catch (error) {
	// 	console.error("No on-going session:", error);
	// }

	const app = document.getElementById('app');
	if (app) {
	  app.innerHTML = /*html*/`
		<div class="text-black font-jaro text-9xl mt-16 select-none">${i18n.t('general.pongGame')}</div>
		<form id="loginForm" class="flex">
			<input type="email" id="email" name="email" placeholder="${i18n.t('login.email')}" required class="mt-44 ml-78 block px-3 py-2 bg-white border border-black text-black rounded-md focus:outline-none">
			<input type="password" id="password" name="password" placeholder="${i18n.t('login.password')}" required class="mt-44 ml-6 block px-3 py-2 bg-white border border-black text-black rounded-md focus:outline-none">
			<button type="submit" class="font-inria px-6 py-2 mr-80 mt-44 ml-6 border border-black rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 hover:outline-none focus:outline-none">${i18n.t('login.login')}</button>
		</form>
		<div id="errorMessage" class="text-red-500 mt-2 hidden">${i18n.t('login.errorLogin')}</div>
		<hr class="mx-auto my-10 border-black w-1/4">
		<button id="createAccountBtn" type="button" class="font-inria w-1/2 border-black rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 hover:outline-none focus:outline-none">${i18n.t('login.createAccount')}</button>
		<div class="text-black my-4">${i18n.t('login.or')}</div>
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
			const response = await fetch(`${baseUrl}/user/login`, {
			  method: 'POST',
			  credentials: 'include',
			  headers: {
				'Content-Type': 'application/json'
			  },
			  body: JSON.stringify({ email, password })
			});
	
			if (!response.ok) {
			  const errorBody = await response.json();
			  throw new Error(errorBody.error);
			}
	
			const data = await response.json();
			console.log("Réponse de login:", data);
			//recup du userId
			const profile = await fetchUserProfile();
			if (profile && profile.userId) {
				localStorage.setItem("userId", profile.userId);
				matchmakingWebSocket(profile.userId);
			} else {
				console.error(i18n.t('login.profileError'));
			}
			history.pushState(null, '', '/menu');
			window.dispatchEvent(new PopStateEvent('popstate'));
		} catch (error) {
			console.error(`${i18n.t('login.loginError')}:`, error);
			errorMessage.textContent = error as string;
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