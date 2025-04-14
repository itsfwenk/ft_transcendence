export default function loginError() {
	const app = document.getElementById('app');
	if (app) {
	  app.innerHTML = /*html*/`
		<div class="flex flex-col items-center justify-center">
		  <div class="text-black font-jaro text-6xl mt-16">Erreur de connexion</div>
		  <p class="text-black mt-8">Une erreur s'est produite lors de la connexion avec Google.</p>
		  <button id="returnToLoginBtn" class="font-inria px-6 py-2 mt-8 border border-black rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
			Retour à la page de connexion
		  </button>
		</div>
	  `;
  
	  const returnBtn = document.getElementById('returnToLoginBtn');
	  returnBtn?.addEventListener('click', () => {
		history.pushState(null, '', '/');
		window.dispatchEvent(new PopStateEvent('popstate'));
	  });
	}
  }