import i18n from '../i18n';

export default function loginSuccess() {
	const app = document.getElementById('app');
	if (app) {
	  app.innerHTML = /*html*/`
		<div class="flex flex-col items-center justify-center">
		  <div class="text-black font-jaro text-6xl mt-16">${i18n.t('login.googleSuccess')}</div>
		  <p class="text-black mt-8">${i18n.t('login.googleSuccessMessage')}</p>
		  <div id="redirectMessage" class="text-black mt-4">${i18n.t('login.redirectMessage')}</div>
		</div>
	  `;
  
	  setTimeout(() => {
		history.pushState(null, '', '/menu');
		window.dispatchEvent(new PopStateEvent('popstate'));
	  }, 3000);
	}
}