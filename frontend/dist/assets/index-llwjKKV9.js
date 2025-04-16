(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))l(t);new MutationObserver(t=>{for(const o of t)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&l(s)}).observe(document,{childList:!0,subtree:!0});function r(t){const o={};return t.integrity&&(o.integrity=t.integrity),t.referrerPolicy&&(o.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?o.credentials="include":t.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function l(t){if(t.ep)return;t.ep=!0;const o=r(t);fetch(t.href,o)}})();function p(){const e=document.getElementById("app");e&&(e.innerHTML=`
        <div class="p-4">
          <h1 class="text-2xl font-bold">Mon Profil</h1>
          <!-- Contenu du profil ici -->
          <p>Information sur l'utilisateur...</p>
          <a href="/menu" data-link class="text-indigo-600 hover:underline">Retour au menu principal</a>
        </div>
      `)}function m(){const e=document.getElementById("app");e&&(e.innerHTML=`
        <div class="flex flex-col items-center justify-center min-h-screen">
			<h1 class="text-3xl font-bold text-blue-600 mb-4">Partie en cours</h1>
          <form id="loginForm" class="space-y-4">
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">lancer</button>
          </form>
          <p class="mt-4">
          </p>
        </div>
      `,document.getElementById("loginForm").addEventListener("submit",r=>{r.preventDefault(),console.log("Connexion...")}))}async function c(){try{const e=window.location.origin,n=await fetch(`${e}/user/getProfile`,{method:"GET",credentials:"include",headers:{"Content-Type":"application/json"}});if(!n.ok)throw new Error(`Erreur lors de la récupération du profil: ${n.statusText}`);const r=await n.json();return console.log("Profil utilisateur:",r),r}catch(e){return console.error("Erreur de récupération du profil:",e),null}}function f(){const e=document.getElementById("app");e&&(e.innerHTML=`
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
		`,document.getElementById("localBtn").addEventListener("click",async l=>{l.preventDefault(),console.log("local button...");try{const t=await fetch("http://localhost:4000/api-game/start",{method:"POST"});if(!t.ok)throw new Error(`Erreur lors du lancement de la page: ${t.statusText}`);const o=await t.json();console.log("Réponse de login:",o),history.pushState(null,"","/game"),window.dispatchEvent(new PopStateEvent("popstate"))}catch(t){console.error("Erreur de login:",t)}}),document.getElementById("onlineBtn").addEventListener("click",async l=>{l.preventDefault(),console.log("online button...");const t=await c();if(console.log(t),!t){console.error("Aucun utilisateur connecté");return}const o=t.userId;console.log("currentPlayerId:",o);try{const s=await fetch("http://localhost:4000/api-matchmaking/join",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({playerId:o})});if(!s.ok)throw new Error(`Erreur lors du lancement de la page: ${s.statusText}`);const a=await s.json();console.log("Réponse de login:",a),history.pushState(null,"","/queue"),window.dispatchEvent(new PopStateEvent("popstate"))}catch(s){console.error("Erreur de login:",s)}}))}async function g(){const e=document.getElementById("app");if(!e)return;e.innerHTML=`
	  <div class="flex flex-col items-center justify-center min-h-screen">
		<h1 class="text-3xl font-bold mb-4">Lobby Matchmaking</h1>
		<p class="text-gray-700">Recherche d'un adversaire...</p>
	  </div>
	`;const n=await c();if(console.log(n),!n){console.error("Aucun utilisateur connecté");return}const r=n.userId;console.log("currentPlayerId:",r)}function b(){const e=document.getElementById("app");if(e){e.innerHTML=`
		<div class="text-black font-jaro text-9xl mt-16">Pong Game</div>
		<form id="loginForm" class="flex">
			<input type="email" id="email" name="email" placeholder="email" required class="mt-44 ml-78 block px-3 py-2 bg-white border border-black text-black rounded-md focus:outline-none">
			<input type="password" id="password" name="password" placeholder="password" required class="mt-44 ml-6 block px-3 py-2 bg-white border border-black text-black rounded-md focus:outline-none">
			<button type="submit" class="font-inria px-6 py-2 mr-80 mt-44 ml-6 border border-black rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 hover:outline-none focus:outline-none">login</button>
		</form>
		<div id="errorMessage" class="text-red-500 mt-2 hidden">Erreur de connexion. Vérifiez vos identifiants.</div>
		<hr class="mx-auto my-10 border-black w-1/4">
		<button id="createAccountBtn" type="button" class="font-inria w-1/2 border-black rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 hover:outline-none focus:outline-none">Create account</button>
		<div class="text-black my-4">or</div>
		<button id="googleLoginBtn" type="button" class="font-inria w-1/2 border border-black rounded-md font-medium text-white bg-red-500 hover:bg-red-600 hover:outline-none focus:outline-none">Google</button>
	  `;const n=document.getElementById("loginForm"),r=document.getElementById("errorMessage");n.addEventListener("submit",async o=>{o.preventDefault(),r.classList.add("hidden");const s=document.getElementById("email").value,a=document.getElementById("password").value;try{const i=window.location.origin,u=await fetch(`${i}/user/login`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:s,password:a})});if(!u.ok)throw new Error("Échec de connexion");const d=await u.json();console.log("Réponse de login:",d),history.pushState(null,"","/menu"),window.dispatchEvent(new PopStateEvent("popstate"))}catch(i){console.error("Erreur de login:",i),r.classList.remove("hidden")}});const l=document.getElementById("createAccountBtn");l==null||l.addEventListener("click",()=>{history.pushState(null,"","/create_account"),window.dispatchEvent(new PopStateEvent("popstate"))});const t=document.getElementById("googleLoginBtn");t==null||t.addEventListener("click",()=>{window.location.href="http://localhost:4000/api-user/auth/google"})}}function h(){const e=document.getElementById("app");e&&(e.innerHTML=`
		<div class="text-black font-jaro text-9xl mt-16 mb-28">Pong Game</div>
		<form id="registerForm" class="flex flex-col gap-6 justify-center items-center">
			<input id="username" type="username" id="username" name="username" placeholder="username" required class="h-10 pl-2 w-1/3 bg-white border border-black text-black rounded-md focus:outline-none">
			<input id="email" type="email" id="email" name="email" placeholder="email" required class="h-10 pl-2 w-1/3 bg-white border border-black text-black rounded-md focus:outline-none">
			<input id="password" type="password" id="password" name="password" placeholder="password" required class="h-10 pl-2 w-1/3 bg-white border border-black text-black rounded-md focus:outline-none">
			<button type="submit" class="font-inria mt-8 w-1/4 border border-black rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 hover:outline-none focus:outline-none">Create new account</button>
		</form>
		<div id="registerStatus" class="mt-4"></div>
        <div class="mt-6">
          <a href="/" data-link class="text-blue-600 hover:underline">Back to login</a>
        </div>
	  `,y())}function y(){const e=document.getElementById("registerForm"),n=document.getElementById("registerStatus");e==null||e.addEventListener("submit",async r=>{r.preventDefault();const l=document.getElementById("username").value,t=document.getElementById("email").value,o=document.getElementById("password").value,s={userName:l,email:t,password:o};try{n.innerHTML=`
		  <p class="text-blue-600">Creating account...</p>
		`;const a=window.location.origin,i=await fetch(`${a}/user/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}),u=await i.json();if(!i.ok){let d=u.error||"Registration failed";n.innerHTML=`
			<p class="text-red-500">${d}</p>
		  `;return}n.innerHTML=`
		  <p class="text-green-500">Account created successfully! Redirecting to login...</p>
		`,setTimeout(()=>{history.pushState(null,"","/"),window.dispatchEvent(new PopStateEvent("popstate"))},2e3)}catch(a){console.error("Registration error:",a),n.innerHTML=`
		  <p class="text-red-500">An error occurred during registration. Please try again.</p>
		`}})}function v(){const e=document.getElementById("app");if(e){e.innerHTML=`
		<div class="flex flex-col items-center justify-center">
		  <div class="text-black font-jaro text-6xl mt-16">Erreur de connexion</div>
		  <p class="text-black mt-8">Une erreur s'est produite lors de la connexion avec Google.</p>
		  <button id="returnToLoginBtn" class="font-inria px-6 py-2 mt-8 border border-black rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
			Retour à la page de connexion
		  </button>
		</div>
	  `;const n=document.getElementById("returnToLoginBtn");n==null||n.addEventListener("click",()=>{history.pushState(null,"","/"),window.dispatchEvent(new PopStateEvent("popstate"))})}}function w(){const e=document.getElementById("app");if(e){const r=new URLSearchParams(window.location.search).get("token");r&&(localStorage.setItem("authToken",r),console.log("Token stocké:",r)),e.innerHTML=`
		<div class="flex flex-col items-center justify-center">
		  <div class="text-black font-jaro text-6xl mt-16">Connexion réussie</div>
		  <p class="text-black mt-8">Vous êtes maintenant connecté avec Google.</p>
		  <div id="redirectMessage" class="text-black mt-4">Redirection automatique dans 3 secondes...</div>
		</div>
	  `,setTimeout(()=>{history.pushState(null,"","/menu"),window.dispatchEvent(new PopStateEvent("popstate"))},3e3)}}console.log("[Tournament] Module chargé");function x(){const e=document.getElementById("app");e&&(e.innerHTML=`
        <div class="flex flex-col items-center justify-center min-h-screen">
			<h1 class="text-3xl font-bold text-blue-600 mb-4">Lancer le tournoi</h1>
          <form id="loginForm" class="space-y-4">
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">lancer</button>
          </form>
          <p class="mt-4">
          </p>
        </div>
      `)}function E(){const e=document.getElementById("app");e&&(e.innerHTML=`
	  <div class="text-black font-jaro text-9xl mt-16 mb-36">Pong Game</div>
	  <div class="flex flex-col justify-center items-center gap-6">
		<button id="PlayBtn" type="button" class="mb-2 text-6xl h-36 font-jaro w-1/2 border-black rounded-md text-white bg-red-600  hover:bg-red-700 hover:outline-none focus:outline-none">Play Game</button>
		<button id="profileBtn" type="button" class="text-6xl h-36 font-jaro w-1/2 border border-black rounded-md text-white  bg-blue-700 hover:bg-blue-800  hover:outline-none focus:outline-none">Profile</button>
		<button id="disconnectBtn" type="button" class="font-jaro w-1/8 h-12 mt-5 border border-black rounded-md font-medium text-white bg-black hover:bg-gray-900 focus:outline-none">disconnect</button>
	  </div>
	  `,document.getElementById("localBtn").addEventListener("click",async t=>{t.preventDefault(),console.log("local button...");try{const o=window.location.origin,s=await fetch(`${o}/game/start`,{method:"POST"});if(!s.ok)throw new Error(`Erreur lors du lancement de la page: ${s.statusText}`);const a=await s.json();console.log("Réponse de login:",a),history.pushState(null,"","/game"),window.dispatchEvent(new PopStateEvent("popstate"))}catch(o){console.error("Erreur de login:",o)}}),document.getElementById("onlineBtn").addEventListener("click",async t=>{t.preventDefault(),console.log("online button...");const o=await c();if(console.log(o),!o){console.error("Aucun utilisateur connecté");return}const s=o.userId;console.log("currentPlayerId:",s);{console.error("Socket non connectée");return}}),document.getElementById("tournamentBtn").addEventListener("click",async t=>{t.preventDefault(),console.log("tournament button...");const o=await c();if(console.log(o),!o){console.error("Aucun utilisateur connecté");return}const s=o.userId;console.log("currentPlayerId:",s);{console.error("Socket non connectée");return}}))}async function k(){const e=document.getElementById("app");if(!e)return;e.innerHTML=`
	  <div class="flex flex-col items-center justify-center min-h-screen">
		<h1 class="text-3xl font-bold mb-4">Lobby Matchmaking</h1>
		<p class="text-gray-700">Recherche des adversaires pour le tournoi...</p>
	  </div>
	`;const n=await c();if(console.log(n),!n){console.error("Aucun utilisateur connecté");return}const r=n.userId;console.log("currentPlayerId:",r)}const B={"/":b,"/profile":p,"/menu":E,"/mode":f,"/game":m,"/queue":g,"/queue_tournament":k,"/tournament":x,"/create_account":h,"/login_error":v,"/login_success":w};function P(){function e(){const n=window.location.pathname,r=B[n],l=document.getElementById("app");l&&r?(l.innerHTML="",r()):l.innerHTML="<h1>Page not found</h1>"}document.addEventListener("click",n=>{const r=n.target;if(r.tagName==="A"&&r.href&&r.getAttribute("data-link")!==null){n.preventDefault();const l=new URL(r.href);history.pushState(null,"",l.pathname),e()}}),window.addEventListener("popstate",e),e()}P();
