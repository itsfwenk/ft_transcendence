export default function loginSuccess() {
	const app = document.getElementById('app');
	if (app) {
	  app.innerHTML = /*html*/`
		<div class="flex flex-col items-center justify-center">
		  <div class="text-black font-jaro text-6xl mt-16">Connexion réussie</div>
		  <p class="text-black mt-8">Vous êtes maintenant connecté avec Google.</p>
		  <div id="redirectMessage" class="text-black mt-4">Redirection automatique dans 3 secondes...</div>
		</div>
	  `;
  
	  setTimeout(() => {
		history.pushState(null, '', '/menu');
		window.dispatchEvent(new PopStateEvent('popstate'));
	  }, 3000);
	}
}