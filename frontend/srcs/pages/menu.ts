export default function menu() {
	const app = document.getElementById('app');
	if (app) {
	  app.innerHTML = /*html*/`
	  <div class="text-black font-jaro text-9xl mt-16 mb-36">Pong Game</div>
	  <div class="flex flex-col justify-center items-center gap-6">
		<button id="PlayBtn" type="button" class="mb-2 text-6xl h-36 font-jaro w-1/2 border-black rounded-md text-white bg-red-600  hover:bg-red-700 hover:outline-none focus:outline-none">Play Game</button>
		<button id="profileBtn" type="button" class="text-6xl h-36 font-jaro w-1/2 border border-black rounded-md text-white  bg-blue-700 hover:bg-blue-800  hover:outline-none focus:outline-none">Profile</button>
		<button id="disconnectBtn" type="button" class="font-jaro w-1/8 h-12 mt-5 border border-black rounded-md font-medium text-white bg-black hover:bg-gray-900 focus:outline-none">disconnect</button>
	  </div>
	  `;

	  setupEventListeners();
	}
}
  
  function setupEventListeners() {

}