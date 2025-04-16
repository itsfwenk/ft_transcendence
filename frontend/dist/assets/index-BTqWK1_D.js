(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function n(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(r){if(r.ep)return;r.ep=!0;const o=n(r);fetch(r.href,o)}})();console.log("[Tournament] Module chargé");function v(){const t=document.getElementById("app");t&&(t.innerHTML=`
        <div class="flex flex-col items-center justify-center min-h-screen">
			<h1 class="text-3xl font-bold text-blue-600 mb-4">Lancer le tournoi</h1>
          <form id="loginForm" class="space-y-4">
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">lancer</button>
          </form>
          <p class="mt-4">
          </p>
        </div>
      `,i!==null&&(console.log("currentState",i),w(i)))}function w(t){const e=document.getElementById("app");if(e)switch(t){case"tournament_queue":e.innerHTML="<h2>En attente de joueurs...</h2>";break;case"tournament_launch":e.innerHTML=`
				<h2>Tournoi pret dans... 5, 4, 3,1, 1</h2>`;break;case"match_1_start":e.innerHTML="<h2>Lancer le match</h2>";break;case"match_2_start":e.innerHTML="<h2>Match termine !</h2>";break;case"match_1_end":e.innerHTML="<h2>Lancer le match</h2>";break;case"match_2_end":e.innerHTML="<h2>Match termine !</h2>";break;case"final_wait":e.innerHTML="<h2>En attente du deuxième finaliste...</h2>";break;case"final_prep":e.innerHTML="<h2>En attente du deuxième finaliste...</h2>";break;case"final_start":e.innerHTML="<h2>lancer la finale</h2>";break;case"final_end":e.innerHTML="<h2>Partie terminée, résultats en cours...</h2>";break;case"tournament_victory_screen":e.innerHTML="<h2>🎉 Félicitations ! Vous avez gagné le tournoi !</h2>";break;case"tournament_loser_screen":e.innerHTML="<h2>Dommage ! Vous êtes éliminé du tournoi</h2>";break;default:e.innerHTML=`<p>État du tournoi : ${t}</p>`;break}}function x(t){const e=document.getElementById("app");if(!e)return;switch(t){case"eliminated":e.innerHTML=`
				<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
					<h2 class="text-2xl font-bold mb-4">Dommage, vous êtes éliminé !</h2>
					<p class="text-gray-600">Vous pourrez retenter votre chance la prochaine fois.</p>
					<button id="backToMenuBtn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Revenir au Menu</button>
				</div>
			`;break;case"waiting_next_round":e.innerHTML=`
				<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
					<h2 class="text-2xl font-bold mb-4">Félicitations, vous avez gagné ce match !</h2>
					<p class="text-gray-600">En attente du prochain tour...</p>
				</div>
			`;break;case"winner":e.innerHTML=`
				<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
					<h2 class="text-2xl font-bold mb-4">Bravo, vous avez gagné le tournoi !</h2>
					<p class="text-gray-600">Vous êtes le champion. Félicitations&nbsp;!</p>
					<button id="backToMenuBtn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Revenir au Menu</button>
				</div>
			`;break;default:e.innerHTML=`
				<div class="bg-white min-h-screen flex flex-col items-center justify-center text-black">
					<h2 class="text-2xl font-bold mb-4">Votre état joueur : ${t}</h2>
					<p class="text-gray-600">En attente d'informations supplémentaires.</p>
				</div>
			`}const n=document.getElementById("backToMenuBtn");n==null||n.addEventListener("click",()=>{history.pushState(null,"","/menu"),window.dispatchEvent(new PopStateEvent("popstate"))})}let g=null,d=null,i=null,E=null;function k(t){console.log("test_websocket",t);const e=window.location.origin.replace(/^https?:\/\//,""),n=new WebSocket(`wss://${e}/matchmaking/ws?playerId=${t}`);return n.onopen=()=>{console.log("Connexion WebSocket matchmaking établie")},n.onmessage=s=>{var r,o;try{const a=JSON.parse(s.data);switch(console.log("Notification WebSocket matchmaking reçue:",a),a.type){case"launch_1v1":history.pushState(null,"",`/game?gameSessionId=${a.gameSessionId}`),window.dispatchEvent(new PopStateEvent("popstate"));break;case"launch_tournament":const l=(o=(r=a.payload)==null?void 0:r.tournament)==null?void 0:o.id;l&&(console.log("Tournoi lancé avec ID :",l),history.pushState(null,"",`/tournament?tournamentId=${l}`),window.dispatchEvent(new PopStateEvent("popstate")));break;case"tournament_state_update":const{state:c,tournament:p}=a.payload,b=p.id;history.pushState(null,"",`/tournament?tournamentId=${b}`),window.dispatchEvent(new PopStateEvent("popstate")),i=c,E=p,console.log("tournament state",i);break;case"match_start":const{gameSessionId:m}=a.payload;console.log("gameSessionId",m),history.pushState(null,"",`/game?gameSessionId=${m}`),window.dispatchEvent(new PopStateEvent("popstate"));break;case"player_state_update":const{state:h,tournament:y}=a.payload;history.pushState(null,"",`/tournament?tournamentId=${y.id}`),window.dispatchEvent(new PopStateEvent("popstate")),console.log("player_state",h),S(h);break;default:break}}catch(a){console.error("Erreur lors du parsing du message matchmaking:",a)}},n.onerror=s=>{console.error("Erreur WebSocket matchmaking:",s)},n.onclose=()=>{console.log("Connexion WebSocket matchmaking fermée")},g=n,n}function f(){return g}function S(t){d=t,console.log("Nouveau playerState =",d),x(d)}async function u(){try{const t=window.location.origin,e=await fetch(`${t}/user/getProfile`,{method:"GET",credentials:"include",headers:{"Content-Type":"application/json"}});if(!e.ok)throw new Error(`Erreur lors de la récupération du profil: ${e.statusText}`);const n=await e.json();return console.log("Profil utilisateur:",n),n}catch(t){return console.error("Erreur de récupération du profil:",t),null}}function I(){const t=document.getElementById("app");t&&(t.innerHTML=`
		<div class="flex flex-col items-center justify-center min-h-screen">
			<h1 class="text-3xl font-bold text-blue-600 mb-4">Bienvenue sur Pong Game</h1>
			<form id="loginForm" class="space-y-4">
			<button type="button" id="localBtn" class="bg-blue-600 text-white px-4 py-2 rounded">Play 1v1 local</button>
			<button type="button" id="onlineBtn" class="bg-blue-600 text-white px-4 py-2 rounded">Play 1v1 online</button>
			<button type="button" id="tournamentBtn" class="bg-blue-600 text-white px-4 py-2 rounded">Play tournament</button>
			</form>
			<p class="mt-4">
			Pas de compte ? <a href="/signup" data-link class="text-indigo-600 hover:underline">Inscrivez-vous</a>
			</p>
		</div>
		`,document.getElementById("localBtn").addEventListener("click",async r=>{r.preventDefault(),console.log("local button...");try{const o=window.location.origin,a=await fetch(`${o}/game/start`,{method:"POST"});if(!a.ok)throw new Error(`Erreur lors du lancement de la page: ${a.statusText}`);const l=await a.json();console.log("Réponse de login:",l),history.pushState(null,"","/game"),window.dispatchEvent(new PopStateEvent("popstate"))}catch(o){console.error("Erreur de login:",o)}}),document.getElementById("onlineBtn").addEventListener("click",async r=>{r.preventDefault(),console.log("online button...");const o=await u();if(console.log(o),!o){console.error("Aucun utilisateur connecté");return}const a=o.userId;console.log("currentPlayerId:",a);const l=f();if(!l||l.readyState!==WebSocket.OPEN){console.error("Socket non connectée");return}l.send(JSON.stringify({action:"join_1v1",payload:{}})),history.pushState(null,"","/queue"),window.dispatchEvent(new PopStateEvent("popstate"))}),document.getElementById("tournamentBtn").addEventListener("click",async r=>{r.preventDefault(),console.log("tournament button...");const o=await u();if(console.log(o),!o){console.error("Aucun utilisateur connecté");return}const a=o.userId;console.log("currentPlayerId:",a);const l=f();if(!l||l.readyState!==WebSocket.OPEN){console.error("Socket non connectée");return}l.send(JSON.stringify({action:"join_tournament",payload:{}})),history.pushState(null,"","/queue_tournament"),window.dispatchEvent(new PopStateEvent("popstate"))}))}function P(){const t=document.getElementById("app");console.log("Module Home recharge"),t&&(t.innerHTML=`
        <div class="flex flex-col items-center justify-center min-h-screen">
          <h1 class="text-3xl font-bold text-blue-600 mb-4">Bienvenue sur Pong Game</h1>
          <form id="loginForm" class="space-y-4">
            <input type="email" id="email" placeholder="Email" class="border border-blue-600 p-3 rounded text-blue-600 placeholder-blue-400" required />
            <input type="password" id="password" placeholder="Mot de passe" class="border border-blue-600 p-3 rounded text-blue-600 placeholder-blue-400" required />
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Se connecter</button>
          </form>
          <p class="mt-4">
            Pas de compte ? <a href="/signup" data-link class="text-indigo-600 hover:underline">Inscrivez-vous</a>
          </p>
        </div>
      `,document.getElementById("loginForm").addEventListener("submit",async n=>{n.preventDefault();const s=document.getElementById("email").value,r=document.getElementById("password").value;try{const o=window.location.origin;console.log(`${o}/user/login`);const a=await fetch(`${o}/user/login`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:s,password:r})});if(!a.ok)throw new Error(`Erreur lors de la connexion: ${a.statusText}`);const l=await a.json();console.log("Réponse de login:",l);const c=await u();c&&c.userId?k(c.userId):console.error("Impossible de recuperer le profile du user"),history.pushState(null,"","/menu"),window.dispatchEvent(new PopStateEvent("popstate"))}catch(o){console.error("Erreur de login:",o)}}))}function L(){const t=document.getElementById("app");t&&(t.innerHTML=`
        <div class="p-4">
          <h1 class="text-2xl font-bold">Mon Profil</h1>
          <!-- Contenu du profil ici -->
          <p>Information sur l'utilisateur...</p>
          <a href="/menu" data-link class="text-indigo-600 hover:underline">Retour au menu principal</a>
        </div>
      `)}function T(){const t=document.getElementById("app");t&&(t.innerHTML=`
        <div class="flex flex-col items-center justify-center min-h-screen">
			<h1 class="text-3xl font-bold text-blue-600 mb-4">Partie en cours</h1>
          <form id="loginForm" class="space-y-4">
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">lancer</button>
          </form>
          <p class="mt-4">
          </p>
        </div>
      `,document.getElementById("loginForm").addEventListener("submit",n=>{n.preventDefault(),console.log("Connexion...")}))}async function M(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
	  <div class="flex flex-col items-center justify-center min-h-screen">
		<h1 class="text-3xl font-bold mb-4">Lobby Matchmaking</h1>
		<p class="text-gray-700">Recherche d'un adversaire...</p>
	  </div>
	`;const e=await u();if(console.log(e),!e){console.error("Aucun utilisateur connecté");return}const n=e.userId;console.log("currentPlayerId:",n)}async function B(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
	  <div class="flex flex-col items-center justify-center min-h-screen">
		<h1 class="text-3xl font-bold mb-4">Lobby Matchmaking</h1>
		<p class="text-gray-700">Recherche des adversaires pour le tournoi...</p>
	  </div>
	`;const e=await u();if(console.log(e),!e){console.error("Aucun utilisateur connecté");return}const n=e.userId;console.log("currentPlayerId:",n)}const _={"/":P,"/profile":L,"/menu":I,"/game":T,"/queue":M,"/queue_tournament":B,"/tournament":v};function H(){function t(){const e=window.location.pathname,n=_[e],s=document.getElementById("app");s&&n?(s.innerHTML="",n()):s.innerHTML="<h1>Page not found</h1>"}document.addEventListener("click",e=>{const n=e.target;if(n.tagName==="A"&&n.href&&n.getAttribute("data-link")!==null){e.preventDefault();const s=new URL(n.href);history.pushState(null,"",s.pathname),t()}}),window.addEventListener("popstate",t),t()}H();
