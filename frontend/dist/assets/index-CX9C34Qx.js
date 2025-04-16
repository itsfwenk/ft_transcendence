(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))l(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&l(i)}).observe(document,{childList:!0,subtree:!0});function o(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function l(r){if(r.ep)return;r.ep=!0;const a=o(r);fetch(r.href,a)}})();console.log("[Tournament] Module chargé");function k(){const t=document.getElementById("app");t&&(t.innerHTML=`
        <div class="flex flex-col items-center justify-center min-h-screen">
			<h1 class="text-3xl font-bold text-blue-600 mb-4">Lancer le tournoi</h1>
          <form id="loginForm" class="space-y-4">
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">lancer</button>
          </form>
          <p class="mt-4">
          </p>
        </div>
      `,p!==null&&(console.log("currentState",p),E(p)))}function E(t){const e=document.getElementById("app");if(e)switch(t){case"tournament_queue":e.innerHTML="<h2>En attente de joueurs...</h2>";break;case"tournament_launch":e.innerHTML=`
				<h2>Tournoi pret dans... 5, 4, 3,1, 1</h2>`;break;case"match_1_start":e.innerHTML="<h2>Lancer le match</h2>";break;case"match_2_start":e.innerHTML="<h2>Match termine !</h2>";break;case"match_1_end":e.innerHTML="<h2>Lancer le match</h2>";break;case"match_2_end":e.innerHTML="<h2>Match termine !</h2>";break;case"final_wait":e.innerHTML="<h2>En attente du deuxième finaliste...</h2>";break;case"final_prep":e.innerHTML="<h2>En attente du deuxième finaliste...</h2>";break;case"final_start":e.innerHTML="<h2>lancer la finale</h2>";break;case"final_end":e.innerHTML="<h2>Partie terminée, résultats en cours...</h2>";break;case"tournament_victory_screen":e.innerHTML="<h2>🎉 Félicitations ! Vous avez gagné le tournoi !</h2>";break;case"tournament_loser_screen":e.innerHTML="<h2>Dommage ! Vous êtes éliminé du tournoi</h2>";break;default:e.innerHTML=`<p>État du tournoi : ${t}</p>`;break}}function S(t){const e=document.getElementById("app");if(!e)return;switch(t){case"eliminated":e.innerHTML=`
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
			`}const o=document.getElementById("backToMenuBtn");o==null||o.addEventListener("click",()=>{history.pushState(null,"","/menu"),window.dispatchEvent(new PopStateEvent("popstate"))})}let w=null,g=null,p=null,I=null;function L(t){console.log("test_websocket",t);const e=window.location.origin.replace(/^https?:\/\//,""),o=new WebSocket(`wss://${e}/matchmaking/ws?playerId=${t}`);return o.onopen=()=>{console.log("Connexion WebSocket matchmaking établie")},o.onmessage=l=>{var r,a;try{const i=JSON.parse(l.data);switch(console.log("Notification WebSocket matchmaking reçue:",i),i.type){case"launch_1v1":history.pushState(null,"",`/game?gameSessionId=${i.gameSessionId}`),window.dispatchEvent(new PopStateEvent("popstate"));break;case"launch_tournament":const s=(a=(r=i.payload)==null?void 0:r.tournament)==null?void 0:a.id;s&&(console.log("Tournoi lancé avec ID :",s),history.pushState(null,"",`/tournament?tournamentId=${s}`),window.dispatchEvent(new PopStateEvent("popstate")));break;case"tournament_state_update":const{state:c,tournament:n}=i.payload,y=n.id;history.pushState(null,"",`/tournament?tournamentId=${y}`),window.dispatchEvent(new PopStateEvent("popstate")),p=c,I=n,console.log("tournament state",p);break;case"match_start":const{gameSessionId:h}=i.payload;console.log("gameSessionId",h),history.pushState(null,"",`/game?gameSessionId=${h}`),window.dispatchEvent(new PopStateEvent("popstate"));break;case"player_state_update":const{state:d,tournament:u}=i.payload;history.pushState(null,"",`/tournament?tournamentId=${u.id}`),window.dispatchEvent(new PopStateEvent("popstate")),console.log("player_state",d),P(d);break;default:break}}catch(i){console.error("Erreur lors du parsing du message matchmaking:",i)}},o.onerror=l=>{console.error("Erreur WebSocket matchmaking:",l)},o.onclose=()=>{console.log("Connexion WebSocket matchmaking fermée")},w=o,o}function x(){return w}function P(t){g=t,console.log("Nouveau playerState =",g),S(g)}async function m(){try{const t=window.location.origin,e=await fetch(`${t}/user/getProfile`,{method:"GET",credentials:"include",headers:{"Content-Type":"application/json"}});if(!e.ok)throw new Error(`Erreur lors de la récupération du profil: ${e.statusText}`);const o=await e.json();return console.log("Profil utilisateur:",o),o}catch(t){return console.error("Erreur de récupération du profil:",t),null}}function M(){const t=document.getElementById("app");t&&(t.innerHTML=`
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
		`,document.getElementById("localBtn").addEventListener("click",r=>{r.preventDefault(),console.log("local button clicked, navigating to /local"),console.log("before history pushState"),history.pushState(null,"","/local"),window.dispatchEvent(new PopStateEvent("popstate"))}),document.getElementById("onlineBtn").addEventListener("click",async r=>{r.preventDefault(),console.log("online button...");const a=await m();if(console.log(a),!a){console.error("Aucun utilisateur connecté");return}const i=a.userId;console.log("currentPlayerId:",i);const s=x();if(!s||s.readyState!==WebSocket.OPEN){console.error("Socket non connectée");return}s.send(JSON.stringify({action:"join_1v1",payload:{}})),history.pushState(null,"","/queue"),window.dispatchEvent(new PopStateEvent("popstate"))}),document.getElementById("tournamentBtn").addEventListener("click",async r=>{r.preventDefault(),console.log("tournament button...");const a=await m();if(console.log(a),!a){console.error("Aucun utilisateur connecté");return}const i=a.userId;console.log("currentPlayerId:",i);const s=x();if(!s||s.readyState!==WebSocket.OPEN){console.error("Socket non connectée");return}s.send(JSON.stringify({action:"join_tournament",payload:{}})),history.pushState(null,"","/queue_tournament"),window.dispatchEvent(new PopStateEvent("popstate"))}))}function T(){const t=document.getElementById("app");console.log("Module Home recharge"),t&&(t.innerHTML=`
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
      `,document.getElementById("loginForm").addEventListener("submit",async o=>{o.preventDefault();const l=document.getElementById("email").value,r=document.getElementById("password").value;try{const a=window.location.origin;console.log(`${a}/user/login`);const i=await fetch(`${a}/user/login`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:l,password:r})});if(!i.ok)throw new Error(`Erreur lors de la connexion: ${i.statusText}`);const s=await i.json();console.log("Réponse de login:",s);const c=await m();c&&c.userId?L(c.userId):console.error("Impossible de recuperer le profile du user"),history.pushState(null,"","/menu"),window.dispatchEvent(new PopStateEvent("popstate"))}catch(a){console.error("Erreur de login:",a)}}))}function B(){const t=document.getElementById("app");t&&(t.innerHTML=`
        <div class="p-4">
          <h1 class="text-2xl font-bold">Mon Profil</h1>
          <!-- Contenu du profil ici -->
          <p>Information sur l'utilisateur...</p>
          <a href="/menu" data-link class="text-indigo-600 hover:underline">Retour au menu principal</a>
        </div>
      `)}function _(){const t=document.getElementById("app");t&&(t.innerHTML=`
        <div class="flex flex-col items-center justify-center min-h-screen">
			<h1 class="text-3xl font-bold text-blue-600 mb-4">Partie en cours</h1>
          <form id="loginForm" class="space-y-4">
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">lancer</button>
          </form>
          <p class="mt-4">
          </p>
        </div>
      `,document.getElementById("loginForm").addEventListener("submit",o=>{o.preventDefault(),console.log("Connexion...")}))}async function H(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
	  <div class="flex flex-col items-center justify-center min-h-screen">
		<h1 class="text-3xl font-bold mb-4">Lobby Matchmaking</h1>
		<p class="text-gray-700">Recherche d'un adversaire...</p>
	  </div>
	`;const e=await m();if(console.log(e),!e){console.error("Aucun utilisateur connecté");return}const o=e.userId;console.log("currentPlayerId:",o)}async function j(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
	  <div class="flex flex-col items-center justify-center min-h-screen">
		<h1 class="text-3xl font-bold mb-4">Lobby Matchmaking</h1>
		<p class="text-gray-700">Recherche des adversaires pour le tournoi...</p>
	  </div>
	`;const e=await m();if(console.log(e),!e){console.error("Aucun utilisateur connecté");return}const o=e.userId;console.log("currentPlayerId:",o)}function F(){let t=document.getElementById("gameCanvas"),e=t.getContext("2d");if(!e)throw new Error("Failed to get 2D context");const o=10,l=80,r=5;let a=0,i=0,s={x:0,y:t.height/2-l/2,dy:0},c={x:t.width-10,y:t.height/2-l/2,dy:0},n={x:t.width/2,y:t.height/2,radius:7,dx:Math.random()>.5?3:-3,dy:Math.random()>.5?3:-3};document.addEventListener("keydown",u=>{u.key==="w"&&(s.dy=-5),u.key==="s"&&(s.dy=r),u.key==="ArrowUp"&&(c.dy=-5),u.key==="ArrowDown"&&(c.dy=r)}),document.addEventListener("keyup",u=>{(u.key==="w"||u.key==="s")&&(s.dy=0),(u.key==="ArrowUp"||u.key==="ArrowDown")&&(c.dy=0)});function y(){s.y+=s.dy,c.y+=c.dy,s.y=Math.max(0,Math.min(t.height-l,s.y)),c.y=Math.max(0,Math.min(t.height-l,c.y)),n.y-n.radius<=0?(n.dy*=-1,n.y+=3):n.y+n.radius>=t.height&&(n.dy*=-1,n.y-=3);const u=1.1;if(n.x-n.radius<=s.x+o&&n.y>=s.y&&n.y<=s.y+l){let f=(n.y-(s.y+l/2))/(l/2);n.dx*=-1,n.dy=f*Math.abs(n.dx),n.x+=2,n.dx*=u,n.dy*=u}if(n.x+n.radius>=c.x&&n.y>=c.y&&n.y<=c.y+l){let f=(n.y-(c.y+l/2))/(l/2);n.dx*=-1,n.dy=f*Math.abs(n.dx),n.x-=2,n.dx*=u,n.dy*=u}n.x+=n.dx,n.y+=n.dy,n.x<0?(i++,b()):n.x>t.width&&(a++,b());function b(){n.x=t.width/2,n.y=t.height/2,n.dx=Math.random()>.5?3:-3,n.dy=Math.random()>.5?3:-3}}function h(){e&&(e.clearRect(0,0,t.width,t.height),e.fillStyle="blue",e.fillRect(s.x,s.y,o,l),e.fillStyle="red",e.fillRect(c.x,c.y,o,l),e.beginPath(),e.arc(n.x,n.y,n.radius,0,Math.PI*2),e.fillStyle="black",e.fill(),e.closePath(),e.fillStyle="black",e.font="20px Arial",e.textAlign="center",e.textBaseline="top",e.fillText(`${a}`,t.width/4,30),e.fillText(`${i}`,t.width*3/4,30))}function d(){y(),h(),requestAnimationFrame(d)}d()}function O(){var e;const t=document.getElementById("app");t&&(t.innerHTML=`
      <div class="flex flex-col items-center">
        <h1 class="text-3xl font-bold text-black p-2">Local Game</h1>
        <canvas id="gameCanvas" width="800" height="400" class="mx-auto block border-8 border-gray-500 bg-white-700"></canvas>
        <div class="mt-4 space-x-2">
          <button id="pauseLocalBtn" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Pause</button>
          <a href="/" data-link class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Home</a>
        </div>
      </div>
    `,(e=document.getElementById("pauseLocalBtn"))==null||e.addEventListener("click",()=>{alert("Game paused. Click OK to resume.")}),setTimeout(()=>{F()},0))}const $={"/":T,"/profile":B,"/menu":M,"/game":_,"/local":O,"/queue":H,"/queue_tournament":j,"/tournament":k};function A(){function t(){const e=window.location.pathname,o=$[e],l=document.getElementById("app");l&&o?(l.innerHTML="",o()):l.innerHTML="<h1>Page not found</h1>"}document.addEventListener("click",e=>{const o=e.target;if(o.tagName==="A"&&o.href&&o.getAttribute("data-link")!==null){e.preventDefault();const l=new URL(o.href);history.pushState(null,"",l.pathname),t()}}),window.addEventListener("popstate",t),t()}A();
