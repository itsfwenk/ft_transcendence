import { fetchUserProfile } from "./profile";

export default async function loginSuccess() {
	const app = document.getElementById('app');
	if (app) {
	  app.innerHTML = /*html*/`
		<div class="flex flex-col items-center justify-center">
		  <div class="text-black font-jaro text-6xl mt-16">Connexion réussie</div>
		  <p class="text-black mt-8">Vous êtes maintenant connecté avec Google.</p>
		  <div id="redirectMessage" class="text-black mt-4">Redirection automatique dans 3 secondes...</div>
		</div>
	  `;
  
	  try {
		const profile = await fetchUserProfile();
		if (profile && profile.user && profile.user.userId) {
		  localStorage.setItem("userId", profile.user.userId);
		  console.log("UserId stocké dans localStorage:", profile.user.userId);
  
		  const redirectMessage = document.getElementById('redirectMessage');
		  if (redirectMessage) {
			redirectMessage.textContent = "Redirection automatique dans 2 secondes...";
		  }
		  
		  setTimeout(() => {
			history.pushState(null, '', '/menu');
			window.dispatchEvent(new PopStateEvent('popstate'));
		  }, 2000);
		} else {
		  console.error("Impossible de récupérer le profil utilisateur");
		  setTimeout(() => {
			history.pushState(null, '', '/');
			window.dispatchEvent(new PopStateEvent('popstate'));
		  }, 3000);
		}
	  } catch (error) {
		console.error("Erreur lors de la récupération du profil:", error);
		setTimeout(() => {
		  history.pushState(null, '', '/');
		  window.dispatchEvent(new PopStateEvent('popstate'));
		}, 3000);
	  }
	}
}