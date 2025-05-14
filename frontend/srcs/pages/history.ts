import { UserData, fetchUserProfile } from './profile';

export default function History() {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = /*html*/`
	<div class="text-black font-jaro text-9xl mt-16 mb-20 select-none">Pong Game</div>
	
	<div class="mx-auto w-4/5 bg-yellow-500 rounded-lg p-6 mb-10">
		<h1 class="text-4xl font-bold mb-6 text-center font-jaro">Match History</h1>

		<div class="max-h-80 overflow-y-auto overflow-x-auto rounded-lg">
			<table class="w-full bg-black rounded-lg">
				<thead class="sticky top-0">
					<tr class="bg-gray-50">
						<th class="text-black font-jaro py-3 px-6 font-bold select-none text-center">Type</th>
						<th class="text-black font-jaro py-3 px-6 font-bold select-none text-center">Opponent</th>
						<th class="text-black font-jaro py-3 px-6 font-bold select-none text-center">Score</th>
						<th class="text-black font-jaro py-3 px-6 font-bold select-none text-center">Date</th>
					</tr>
				</thead>
				<tbody id="matchHistoryBody" class="bg-gray-600">
					<tr>
						<td colspan="4" class="py-3 px-6 text-center text-white">Chargement de l'historique...</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
      
	<div class="flex justify-center items-center">
		<div id="backBtn" class='button w-24 h-13 mt-10 bg-gray-700 rounded-full cursor-pointer select-none
		hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#181818,0_0px_0_0_#1b70f841]
		hover:border-b-[0px]
		transition-all duration-150 [box-shadow:0_10px_0_0_#181818,0_15px_0_0_#1b70f841]
		border-b-[1px] border-gray-400'>
		<span class='flex flex-col justify-center items-center h-full text-white font-jaro'>Back</span>
		</div>
	</div>
    `;
    
    loadMatchHistory();
    setupEventListeners();
  }
}

async function loadMatchHistory() {
  const userData = await fetchUserProfile();
  if (!userData || !userData.matchHistory) {
    showNoMatchesMessage();
    return;
  }
  
  renderMatchHistory(userData);
}

function renderMatchHistory(userData: UserData) {
  const matchHistoryBody = document.getElementById('matchHistoryBody');
  if (!matchHistoryBody) return;
  
  if (!userData.matchHistory || userData.matchHistory.length === 0) {
    showNoMatchesMessage();
    return;
  }
  
  const matchesHTML = userData.matchHistory.map(match => {
    const date = new Date(match.date);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    
    const matchType = match.gameType;
    
    const scoreDisplay = `${match.score.player} - ${match.score.opponent}`;
    
    const scoreColorClass = match.result === 'win' ? 'text-green-700 font-bold' : 'text-red-500 font-bold';
    
    return `
      <tr class="border-b border-gray-500">
        <td class="bg-gray-400 font-jaro py-3 px-6 text-center select-none">${matchType}</td>
        <td class="bg-gray-400 font-jaro py-3 px-6 text-center select-none text-red-500">${match.opponent.userName}</td>
        <td class="bg-gray-400 font-jaro py-3 px-6 text-center select-none ${scoreColorClass}">${scoreDisplay}</td>
        <td class="bg-gray-400 font-jaro py-3 px-6 text-center select-none">${formattedDate}</td>
      </tr>
    `;
  }).join('');
  
  matchHistoryBody.innerHTML = matchesHTML;
}

function showNoMatchesMessage() {
  const matchHistoryBody = document.getElementById('matchHistoryBody');
  if (matchHistoryBody) {
    matchHistoryBody.innerHTML = `
      <tr>
        <td colspan="4" class="py-10 px-6 text-center text-white">
          Aucun match dans l'historique
        </td>
      </tr>
    `;
  }
}

function setupEventListeners() {
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      history.pushState(null, '', '/profile');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
  }
}