// import { UserData, fetchUserProfile, getAvatarUrl, updateProfileBoxUI } from './profile';

export default  async function historyProfile() {
	const app = document.getElementById('app');
	if (app) {
	  app.innerHTML = /*html*/`
		<div id="historyBox" class="h-80 w-1/3 bg-yellow-500 rounded-lg p-4 text-white">
			<div class="text-xl font-bold mb-4 font-jaro select-none">Match History</div>
		</div>
	  `;
	}
}
