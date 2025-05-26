import i18n, { changeLanguage, supportedLanguages, t } from '../i18n';

export interface UserData {
	user: {
		userName: string;
		email: string;
		status: string;
		avatarUrl: string;
		userId: string;
	};
	stats: {
		totalGames: number;
		wins: number;
		losses: number;
		winRate: number;
	};
	matchHistory: Array<{
		gameId: string;
		gameType: string;
		opponent: {
			userId: string;
			userName: string;
		};
		result: 'win' | 'loss';
		score: {
			player: number;
			opponent: number;
		};
		date: string;
	}>;
}

export interface Friend {
	userId: string;
	userName: string;
	status: string;
	avatarUrl: string;
}

export function getAvatarUrl(userId: string): string {
	const baseUrl = window.location.origin;
	const cacheBuster = new Date().getTime();
	return `${baseUrl}/user/avatar/${userId}?v=${cacheBuster}`;
}

export async function fetchUserProfile(): Promise<UserData | null> {
	try {
		const baseUrl = window.location.origin;
		const response = await fetch(`${baseUrl}/user/dashboard`, {
			method: 'GET',
			credentials: 'include'
		});

		if (!response.ok) {
			throw new Error(`Échec de la récupération du profil: ${response.statusText}`);
		}
		
		const data = await response.json();
		console.log("Structure des données reçues:", JSON.stringify(data, null, 2));
		
		return data;
	} catch (error) {
		console.error("Erreur lors de la recuperation du profil utilisateur:", error);
		return null;
	}
}

export async function fetchFriends(): Promise<Friend[]> {
	try {
		const baseUrl = window.location.origin;
		const response = await fetch(`${baseUrl}/user/friends`, {
			method: 'GET',
			credentials: 'include'
		});

		if (!response.ok) {
			throw new Error(`Échec de la récupération des amis: ${response.statusText}`);
		}

		const data = await response.json();
		console.log("Liste d'amis reçue:", data);
		
		if (data.success && Array.isArray(data.friends)) {
			return data.friends;
		}
		
		return [];
	} catch (error) {
		console.error("Erreur lors de la récupération des amis:", error);
		return [];
	}
}

export async function addFriend(userName: string): Promise<{ success: boolean; message: string; friend?: Friend }> {
	try {
		const baseUrl = window.location.origin;
		console.log('debut de fonction addfriend', userName);
		const response = await fetch(`${baseUrl}/user/friends/${userName}`, {
			method: 'POST',
			credentials: 'include'
		});

		const data = await response.json();
		
		if (!response.ok) {
			return { 
				success: false, 
				message: data.error || "Échec de l'ajout d'ami" 
			};
		}

		return { 
			success: true, 
			message: data.message || "Ami ajouté avec succès",
			friend: data.friend
		};
	} catch (error) {
		console.error("Erreur lors de l'ajout d'un ami:", error);
		return { 
			success: false, 
			message: "Une erreur est survenue lors de l'ajout d'ami" 
		};
	}
}

export function updateProfileBoxUI(userData: UserData | null) {
	if (!userData) return;

	const profileImage = document.getElementById('profileImage') as HTMLImageElement;
	if (profileImage && userData.user) {
		const userId = userData.user.userId;
		if (userId) {
			profileImage.src = getAvatarUrl(userId);
			profileImage.onerror = function() {
				this.onerror = null;
				this.src = '/avatars/default.png';
			};
		} else if (userData.user.avatarUrl) {
			profileImage.src = userData.user.avatarUrl;
		} else {
			profileImage.src = '/avatars/default.png';
		}
	}

	const usernameElement = document.getElementById('username');
	if (usernameElement && userData.user && userData.user.userName) {
		usernameElement.textContent = userData.user.userName;
	}

	const emailElement = document.getElementById('email');
	if (emailElement && userData.user && userData.user.email) {
		emailElement.textContent = userData.user.email;
	}

	if (userData.stats) {
		const nbGamesElement = document.getElementById('nbGames');
		if (nbGamesElement) {
			nbGamesElement.textContent = String(userData.stats.totalGames || 0);
		}

		const statWinElement = document.getElementById('statWin');
		if (statWinElement) {
			statWinElement.textContent = String(userData.stats.wins || 0);
		}

		const statLossesElement = document.getElementById('statLosses');
		if (statLossesElement) {
			statLossesElement.textContent = String(userData.stats.losses || 0);
		}

		const statWinRateElement = document.getElementById('statWinRate');
		if (statWinRateElement) {
			const winRate = userData.stats.winRate || 0;
			statWinRateElement.textContent = `${Math.round(winRate)}%`;
		}
	}
}

export function renderFriendsList(friends: Friend[]) {
	const friendsListElement = document.getElementById('friendsList');
	if (!friendsListElement) return;

	if (friends.length === 0) {
		friendsListElement.innerHTML = `
			<div class="text-center text-gray-300 mt-8">
				<p>${i18n.t('profile.noFriends')}</p>
				<p class="mt-2 text-sm">${i18n.t('profile.useAddButton')}</p>
			</div>
		`;
		return;
	}

	const friendsHTML = friends.map((friend, index) => {
		const isOnline = friend.status === 'online';
		const statusColor = isOnline ? 'bg-green-500' : 'bg-gray-500';
		
		return `
			<div class="flex items-center mb-3 bg-red-800 rounded-md p-2 hover:bg-red-900 transition-colors">
				<div class="relative mr-3">
					<div class="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
						<img 
							src="${getAvatarUrl(friend.userId)}" 
							alt="User avatar"
							class="w-full h-full object-cover select-none"
							onerror="this.onerror=null; this.src='/avatars/default.png';"
						/>
					</div>
					<div class="absolute bottom-0 right-0 w-3 h-3 ${statusColor} border-2 border-red-800 rounded-full select-none"></div>
				</div>
				<div class="flex-grow">
					<div class="font-bold select-none" data-username="${index}"></div>
					<div class="text-xs text-gray-300 select-none">${isOnline ? t('profile.online') : t('profile.offline')}</div>
				</div>
			</div>
		`;
	}).join('');

	friendsListElement.innerHTML = friendsHTML;

	friends.forEach((friend, index) => {
		const usernameElement = document.querySelector(`[data-username="${index}"]`);
		if (usernameElement) {
			usernameElement.textContent = friend.userName;
		}
	});
}

export function showFriendStatus(message: string, isSuccess: boolean) {
	const statusElement = document.getElementById('friendStatus');
	const contentElement = document.getElementById('friendStatusContent');
	
	if (statusElement && contentElement) {
		contentElement.textContent = message;
		contentElement.className = isSuccess 
			? 'px-4 py-2 rounded-md bg-green-500 text-white select-none'
			: 'px-4 py-2 rounded-md bg-red-500 text-white select-none';
		
		statusElement.classList.remove('hidden');
		
		setTimeout(() => {
			statusElement.classList.add('hidden');
		}, 3000);
	}
}

export function toggleFriendSearch(show: boolean) {
	const searchContainer = document.getElementById('friendSearchContainer');
	
	if (searchContainer) {
		if (show) {
			searchContainer.classList.remove('hidden');
			const searchInput = document.getElementById('friendSearchInput') as HTMLInputElement;
			if (searchInput) {
				searchInput.focus();
			}
		} else {
			searchContainer.classList.add('hidden');
			const searchInput = document.getElementById('friendSearchInput') as HTMLInputElement;
			if (searchInput) {
				searchInput.value = '';
			}
		}
	}
}

function createCustomizeButton(): string {
	const gradientAnimationStyle = `
		<style>
			@keyframes gradientShift {
				0% {
					background-position: 0% 50%;
				}
				50% {
					background-position: 100% 50%;
				}
				100% {
					background-position: 0% 50%;
				}
			}
			
			.gradient-animate {
				background: linear-gradient(270deg, #9333ea, #ef4444, #eab308, #ec4899, #3b82f6, #22c55e);
				background-size: 600% 600%;
				animation: gradientShift 8s ease infinite;
			}
			
			.text-appear {
				transition: opacity 0.5s ease, transform 0.5s ease;
			}
			
			.customize-button:hover .text-appear {
				opacity: 1;
				transform: translateX(0);
			}
		</style>
	`;
	
	return `
		${gradientAnimationStyle}
		<div class="relative group">
			<button id="customize-button" class="customize-button gradient-animate text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 flex items-center shadow-lg hover:shadow-xl transition-shadow duration-300">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
				</svg>
			</button>
		</div>
	`;
}

function createHeaderControls(): string {
	const currentLang = i18n.language || 'en';
	
	const options = supportedLanguages.map(lang => {
		const selected = lang.code === currentLang ? 'selected' : '';
		return `<option value="${lang.code}" ${selected}>${lang.name}</option>`;
	}).join('');
	
	return `
		<div class="flex justify-between items-center mb-4 w-full px-4">
			${createCustomizeButton()}
			
			<div class="relative group">
				<select id="language-selector" class="appearance-none bg-blue-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 pr-8 cursor-pointer transition-colors duration-200 hover:bg-blue-800">
					${options}
				</select>
				<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
					<svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
						<path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
					</svg>
				</div>
			</div>
		</div>
	`;
}

export default function Profile() {
	const app = document.getElementById('app');
	if (app) {
		app.innerHTML = /*html*/`
		${createHeaderControls()}
		
		<div class="text-black font-jaro text-9xl mt-10 mb-16 select-none">${i18n.t('general.pongGame')}</div>
		
		<div id="friendSearchContainer" class="hidden flex justify-center items-center mb-12 gap-10">
			<div class="flex items-center bg-white rounded-md shadow-md w-1/3">
				<input type="text" id="friendSearchInput" class="flex-grow py-2 px-4 rounded-l-md focus:outline-none text-black" placeholder="${i18n.t('profile.searchUser')}" />
				<button id="confirmFriendSearch" class="bg-green-500 hover:bg-green-600 text-white py-2 px-4">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
				</button>
				<button id="cancelFriendSearch" class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-r-md">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
		
		<div>
		<div id="twoBox" class="flex justify-center items-center mb-12 gap-5">
			<div id="profilBox" class="h-80 w-1/3 bg-blue-700 rounded-lg p-4 text-white">
				<div id="img_name" class="flex items-center mb-4">
					<div id="img" class="w-28 h-28 rounded-lg bg-gray-300 mr-4 overflow-hidden">
						<img id="profileImage" src="/avatars/default.png" alt="Profile" class="w-full h-full object-cover select-none"/>
					</div>
					<div id="username" class="flex justify-center items-center text-xl font-bold font-jaro bg-white text-black rounded-lg pl-2 pr-2 pb-0.5 select-none">${i18n.t('general.loading')}</div>
				</div>
				<div id="email" class="flex mb-3 font-jaro select-none">${i18n.t('general.loading')}</div>
				<div id="totalGames" class="flex mb-2">
					<div class="font-jaro text-2xl select-none">${i18n.t('profile.totalGames')}: </div>
					<div id="nbGames" class="ml-2 pt-0.5 font-jaro text-xl">0</div>
				</div>
				<div id="stats" class="flex justify-around items-center mt-3 text-center">
					<div id="win" class="flex flex-col items-center gap-4">
						<div class="font-bold font-jaro text-2xl select-none">${i18n.t('profile.win')}</div>
						<div id="statWin" class="text-xl font-jaro select-none">0</div>
					</div>
					<div id="losses" class="flex flex-col items-center gap-4">
						<div class="font-bold font-jaro text-2xl select-none">${i18n.t('profile.losses')}</div>
						<div id="statLosses" class="text-xl font-jaro select-none">0</div>
					</div>
					<div id="winrate" class="flex flex-col items-center gap-4">
						<div class="font-bold font-jaro text-2xl select-none">${i18n.t('profile.winRate')}</div>
						<div id="statWinRate" class="text-xl font-jaro select-none">0%</div>
					</div>
				</div>
			</div>
	
			<div id="friendBox" class="h-80 w-1/3 bg-red-700 rounded-lg p-4 text-white">
				<div class="text-xl font-bold mb-4 font-jaro select-none">${i18n.t('profile.friends')}</div>
				<div id="friendsList" class="overflow-y-auto h-64 pr-2">
					<div class="text-center text-gray-300 mt-10">${i18n.t('general.loading')}</div>
				</div>
			</div>
		</div>
		
		<div id="friendStatus" class="hidden flex justify-center items-center mb-4">
			<div id="friendStatusContent" class="px-4 py-2 rounded-md"></div>
		</div>
		
		<div class="flex justify-center items-center gap-9">
			<div id="editBtn" class='button mb-2 h-20 w-1/6 bg-gray-400 rounded-lg cursor-pointer select-none
			hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#787f8e,0_0px_0_0_#1b70f841]
			hover:border-b-[0px]
			transition-all duration-150 [box-shadow:0_10px_0_0_#787f8e,0_15px_0_0_#1b70f841]
			border-b-[1px] border-gray-300'>
			<span class='flex flex-col justify-center items-center h-full text-white font-jaro text-2xl '>${i18n.t('profile.editProfile')}</span>
			</div>
	
			<div id="historyBtn" class='button mb-2 text-6xl h-20 w-1/6 bg-yellow-500 rounded-lg cursor-pointer select-none
			hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#d49218,0_0px_0_0_#1b70f841]
			hover:border-b-[0px]
			transition-all duration-150 [box-shadow:0_10px_0_0_#d49218,0_15px_0_0_#1b70f841]
			border-b-[1px] border-yellow-200'>
			<span class='flex flex-col justify-center items-center h-full text-white font-jaro text-2xl '>${i18n.t('profile.matchHistory')}</span>
			</div>
	
			<div id="addFriendBtn" class='button mb-2 text-6xl h-20 w-1/6 bg-green-600 rounded-lg cursor-pointer select-none
			hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#15803d,0_0px_0_0_#1b70f841]
			hover:border-b-[0px]
			transition-all duration-150 [box-shadow:0_10px_0_0_#15803d,0_15px_0_0_#1b70f841]
			border-b-[1px] border-green-400'>
			<span class='flex flex-col justify-center items-center h-full text-white font-jaro text-2xl '>${i18n.t('profile.addFriend')}</span>
			</div>
	
		</div>
		<div class="flex justify-center items-center">
			<div id="backBtn" class='button w-24 h-13 mt-10 bg-gray-700 rounded-full cursor-pointer select-none
			hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#181818,0_0px_0_0_#1b70f841]
			hover:border-b-[0px]
			transition-all duration-150 [box-shadow:0_10px_0_0_#181818,0_15px_0_0_#1b70f841]
			border-b-[1px] border-gray-400'>
			<span class='flex flex-col justify-center items-center h-full text-white font-jaro'>${i18n.t('general.back')}</span>
			</div>
		</div>
		</div>
		`;
	
		setupProfilePage();
	}
}

async function setupProfilePage() {
	const userData = await fetchUserProfile();
	if (userData) {
		updateProfileBoxUI(userData);
	} else {
		console.error("Impossible de charger les données du profil");
	}
	
	const friends = await fetchFriends();
	renderFriendsList(friends);
	
	setupEventListeners();
}

function setupEventListeners() {
	const customizeButton = document.getElementById('customize-button');
	if (customizeButton) {
		customizeButton.addEventListener('click', () => {
			history.pushState(null, '', '/customGame');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
	}
	
	const languageSelector = document.getElementById('language-selector');
	if (languageSelector) {
		languageSelector.addEventListener('change', (event) => {
			const target = event.target as HTMLSelectElement;
			const selectedLang = target.value;
			
			changeLanguage(selectedLang).then(() => {
				window.location.reload();
			}).catch(error => {
				console.error("Erreur lors du changement de langue:", error);
			});
		});
	}

	const backBtn = document.getElementById('backBtn');
	if (backBtn) {
		backBtn.addEventListener('click', () => {
			history.pushState(null, '', '/menu');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
	}

	const editBtn = document.getElementById('editBtn');
	if (editBtn) {
		editBtn.addEventListener('click', () => {
			history.pushState(null, '', '/edit_profile');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
	}

	const historyBtn = document.getElementById('historyBtn');
	if (historyBtn) {
		historyBtn.addEventListener('click', () => {
			history.pushState(null, '', '/history');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
	}

	const addFriendBtn = document.getElementById('addFriendBtn');
	if (addFriendBtn) {
		addFriendBtn.addEventListener('click', () => {
			toggleFriendSearch(true);
		});
	}
	
	const confirmFriendSearch = document.getElementById('confirmFriendSearch');
	if (confirmFriendSearch) {
		confirmFriendSearch.addEventListener('click', async () => {
			const searchInput = document.getElementById('friendSearchInput') as HTMLInputElement;
			
			if (searchInput && searchInput.value.trim()) {
				const userName = searchInput.value.trim();
				
				const result = await addFriend(userName);
				
				showFriendStatus(result.message, result.success);
				
				if (result.success && result.friend) {
					const friends = await fetchFriends();
					renderFriendsList(friends);
				}
				
				toggleFriendSearch(false);
			}
		});
	}
	
	const cancelFriendSearch = document.getElementById('cancelFriendSearch');
	if (cancelFriendSearch) {
		cancelFriendSearch.addEventListener('click', () => {
			toggleFriendSearch(false);
		});
	}
	
	const searchInput = document.getElementById('friendSearchInput') as HTMLInputElement;
	if (searchInput) {
		searchInput.addEventListener('keypress', (event) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				confirmFriendSearch?.click();
			}
		});
	}
}