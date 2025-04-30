// src/pages/Profile.ts
export default function Profile() {
	const app = document.getElementById('app');
	if (app) {
		app.innerHTML = /*html*/`
		<div class="text-black font-jaro text-9xl mt-16 mb-36 select-none">Pong Game</div>
		<div>
			<div>
				<div id="profilBox"></div>
				<div id="friendBox"></div>
			</div>
			<div>
				<div id="editBtn" class='button mb-2 text-6xl h-36 w-1/2 bg-blue-600 rounded-lg cursor-pointer select-none
				hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
				hover:border-b-[0px]
				transition-all duration-150 [box-shadow:0_10px_0_0_#c7181f,0_15px_0_0_#1b70f841]
				border-b-[1px] border-red-400'>
					<span class='flex flex-col justify-center items-center h-full text-white font-jaro text-6xl '>Play Game</span>
				</div>
				<div id="historyBtn" class='button mb-2 text-6xl h-36 w-1/2 bg-red-600 rounded-lg cursor-pointer select-none
				hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
				hover:border-b-[0px]
				transition-all duration-150 [box-shadow:0_10px_0_0_#c7181f,0_15px_0_0_#1b70f841]
				border-b-[1px] border-red-400'>
					<span class='flex flex-col justify-center items-center h-full text-white font-jaro text-6xl '>Play Game</span>
				</div>
				<div id="addFriendBtn" class='button mb-2 text-6xl h-36 w-1/2 bg-red-600 rounded-lg cursor-pointer select-none
				hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
				hover:border-b-[0px]
				transition-all duration-150 [box-shadow:0_10px_0_0_#c7181f,0_15px_0_0_#1b70f841]
				border-b-[1px] border-red-400'>
					<span class='flex flex-col justify-center items-center h-full text-white font-jaro text-6xl '>Play Game</span>
				</div>
			</div>
			<div id="backBtn" class='button w-24 h-13 mt-10 bg-gray-700 rounded-full cursor-pointer select-none
			hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
			hover:border-b-[0px]
			transition-all duration-150 [box-shadow:0_10px_0_0_#181818,0_15px_0_0_#1b70f841]
			border-b-[1px] border-gray-400'>
				<span class='flex flex-col justify-center items-center h-full text-white font-jaro'>Back</span>
			</div>
		</div>
		`;
		}
	}