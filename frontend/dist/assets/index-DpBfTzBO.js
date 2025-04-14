(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const l of t.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function s(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function n(e){if(e.ep)return;e.ep=!0;const t=s(e);fetch(e.href,t)}})();function c(){const o=document.getElementById("app");console.log("Module Home recharge"),o&&(o.innerHTML=`
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
      `,document.getElementById("loginForm").addEventListener("submit",async s=>{s.preventDefault();const n=document.getElementById("email").value,e=document.getElementById("password").value;try{const t=window.location.origin;console.log(`${t}/user/login`);const l=await fetch(`${t}/user/login`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:n,password:e})});if(!l.ok)throw new Error(`Erreur lors de la connexion: ${l.statusText}`);const a=await l.json();console.log("Réponse de login:",a),history.pushState(null,"","/menu"),window.dispatchEvent(new PopStateEvent("popstate"))}catch(t){console.error("Erreur de login:",t)}}))}function u(){const o=document.getElementById("app");o&&(o.innerHTML=`
        <div class="p-4">
          <h1 class="text-2xl font-bold">Mon Profil</h1>
          <!-- Contenu du profil ici -->
          <p>Information sur l'utilisateur...</p>
          <a href="/menu" data-link class="text-indigo-600 hover:underline">Retour au menu principal</a>
        </div>
      `)}async function i(){try{const o=await fetch("http://localhost:4000/api-user/getProfile",{method:"GET",credentials:"include",headers:{"Content-Type":"application/json"}});if(!o.ok)throw new Error(`Erreur lors de la récupération du profil: ${o.statusText}`);const r=await o.json();return console.log("Profil utilisateur:",r),r}catch(o){return console.error("Erreur de récupération du profil:",o),null}}function d(){const o=document.getElementById("app");o&&(o.innerHTML=`
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
		`,document.getElementById("localBtn").addEventListener("click",async n=>{n.preventDefault(),console.log("local button...");try{const e=await fetch("http://localhost:4000/api-game/start",{method:"POST"});if(!e.ok)throw new Error(`Erreur lors du lancement de la page: ${e.statusText}`);const t=await e.json();console.log("Réponse de login:",t),history.pushState(null,"","/game"),window.dispatchEvent(new PopStateEvent("popstate"))}catch(e){console.error("Erreur de login:",e)}}),document.getElementById("onlineBtn").addEventListener("click",async n=>{n.preventDefault(),console.log("online button...");const e=await i();if(console.log(e),!e){console.error("Aucun utilisateur connecté");return}const t=e.userId;console.log("currentPlayerId:",t);try{const l=await fetch("http://localhost:4000/api-matchmaking/join",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({playerId:t})});if(!l.ok)throw new Error(`Erreur lors du lancement de la page: ${l.statusText}`);const a=await l.json();console.log("Réponse de login:",a),history.pushState(null,"","/queue"),window.dispatchEvent(new PopStateEvent("popstate"))}catch(l){console.error("Erreur de login:",l)}}))}function p(){const o=document.getElementById("app");o&&(o.innerHTML=`
        <div class="flex flex-col items-center justify-center min-h-screen">
			<h1 class="text-3xl font-bold text-blue-600 mb-4">Lancer la partie</h1>
          <form id="loginForm" class="space-y-4">
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">lancer</button>
          </form>
          <p class="mt-4">
          </p>
        </div>
      `,document.getElementById("loginForm").addEventListener("submit",s=>{s.preventDefault(),console.log("Connexion...")}))}async function m(){const o=document.getElementById("app");if(!o)return;o.innerHTML=`
	  <div class="flex flex-col items-center justify-center min-h-screen">
		<h1 class="text-3xl font-bold mb-4">Lobby Matchmaking</h1>
		<p class="text-gray-700">Recherche d'un adversaire...</p>
	  </div>
	`;const r=await i();if(console.log(r),!r){console.error("Aucun utilisateur connecté");return}const s=r.userId;console.log("currentPlayerId:",s);const n=new WebSocket(`ws://localhost:4000/api-matchmaking/ws?playerId=${s}`);n.onopen=()=>{console.log("Connexion WebSocket établie")},n.onmessage=e=>{try{const t=JSON.parse(e.data);console.log("Notification WebSocket reçue:",t),t.gameSessionId&&(history.pushState(null,"",`/game?gameSessionId=${t.gameSessionId}`),window.dispatchEvent(new PopStateEvent("popstate")))}catch(t){console.error("Erreur lors du parsing du message:",t)}},n.onerror=e=>{console.error("Erreur WebSocket:",e)},n.onclose=()=>{console.log("Connexion WebSocket fermée")}}const f={"/":c,"/profile":u,"/menu":d,"/game":p,"/queue":m};function g(){function o(){const r=window.location.pathname,s=f[r],n=document.getElementById("app");n&&s?(n.innerHTML="",s()):n.innerHTML="<h1>Page not found</h1>"}document.addEventListener("click",r=>{const s=r.target;if(s.tagName==="A"&&s.href&&s.getAttribute("data-link")!==null){r.preventDefault();const n=new URL(s.href);history.pushState(null,"",n.pathname),o()}}),window.addEventListener("popstate",o),o()}g();
