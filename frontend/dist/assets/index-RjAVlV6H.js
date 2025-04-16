(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function n(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(o){if(o.ep)return;o.ep=!0;const r=n(o);fetch(o.href,r)}})();function m(){const e=document.getElementById("app");e&&(e.innerHTML=`
        <div class="p-4">
          <h1 class="text-2xl font-bold">Mon Profil</h1>
          <!-- Contenu du profil ici -->
          <p>Information sur l'utilisateur...</p>
          <a href="/menu" data-link class="text-indigo-600 hover:underline">Retour au menu principal</a>
        </div>
      `)}function p(){const e=document.getElementById("app");e&&(e.innerHTML=`
        <div class="flex flex-col items-center justify-center min-h-screen">
			<h1 class="text-3xl font-bold text-blue-600 mb-4">Partie en cours</h1>
          <form id="loginForm" class="space-y-4">
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">lancer</button>
          </form>
          <p class="mt-4">
          </p>
        </div>
      `,document.getElementById("loginForm").addEventListener("submit",n=>{n.preventDefault(),console.log("Connexion...")}))}console.log("[Tournament] Module chargé");function f(){const e=document.getElementById("app");e&&(e.innerHTML=`
        <div class="flex flex-col items-center justify-center min-h-screen">
			<h1 class="text-3xl font-bold text-blue-600 mb-4">Lancer le tournoi</h1>
          <form id="loginForm" class="space-y-4">
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">lancer</button>
          </form>
          <p class="mt-4">
          </p>
        </div>
      `)}async function u(){try{const e=window.location.origin,t=await fetch(`${e}/user/getProfile`,{method:"GET",credentials:"include",headers:{"Content-Type":"application/json"}});if(!t.ok)throw new Error(`Erreur lors de la récupération du profil: ${t.statusText}`);const n=await t.json();return console.log("Profil utilisateur:",n),n}catch(e){return console.error("Erreur de récupération du profil:",e),null}}function b(){const e=document.getElementById("app");e&&(e.innerHTML=`
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
		`,document.getElementById("localBtn").addEventListener("click",async o=>{o.preventDefault(),console.log("local button...");try{const r=window.location.origin,i=await fetch(`${r}/game/start`,{method:"POST"});if(!i.ok)throw new Error(`Erreur lors du lancement de la page: ${i.statusText}`);const l=await i.json();console.log("Réponse de login:",l),history.pushState(null,"","/game"),window.dispatchEvent(new PopStateEvent("popstate"))}catch(r){console.error("Erreur de login:",r)}}),document.getElementById("onlineBtn").addEventListener("click",async o=>{o.preventDefault(),console.log("online button...");const r=await u();if(console.log(r),!r){console.error("Aucun utilisateur connecté");return}const i=r.userId;console.log("currentPlayerId:",i);{console.error("Socket non connectée");return}}),document.getElementById("tournamentBtn").addEventListener("click",async o=>{o.preventDefault(),console.log("tournament button...");const r=await u();if(console.log(r),!r){console.error("Aucun utilisateur connecté");return}const i=r.userId;console.log("currentPlayerId:",i);{console.error("Socket non connectée");return}}))}async function g(){const e=document.getElementById("app");if(!e)return;e.innerHTML=`
	  <div class="flex flex-col items-center justify-center min-h-screen">
		<h1 class="text-3xl font-bold mb-4">Lobby Matchmaking</h1>
		<p class="text-gray-700">Recherche d'un adversaire...</p>
	  </div>
	`;const t=await u();if(console.log(t),!t){console.error("Aucun utilisateur connecté");return}const n=t.userId;console.log("currentPlayerId:",n)}function h(){const e=document.getElementById("app");if(e){e.innerHTML=`
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
	  `;const t=document.getElementById("loginForm"),n=document.getElementById("errorMessage");t.addEventListener("submit",async r=>{r.preventDefault(),n.classList.add("hidden");const i=document.getElementById("email").value,l=document.getElementById("password").value;try{const a=window.location.origin,c=await fetch(`${a}/user/login`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:i,password:l})});if(!c.ok)throw new Error("Échec de connexion");const d=await c.json();console.log("Réponse de login:",d),history.pushState(null,"","/menu"),window.dispatchEvent(new PopStateEvent("popstate"))}catch(a){console.error("Erreur de login:",a),n.classList.remove("hidden")}});const s=document.getElementById("createAccountBtn");s==null||s.addEventListener("click",()=>{history.pushState(null,"","/create_account"),window.dispatchEvent(new PopStateEvent("popstate"))});const o=document.getElementById("googleLoginBtn");o==null||o.addEventListener("click",()=>{window.location.href="http://localhost:4000/api-user/auth/google"})}}function y(){const e=document.getElementById("app");e&&(e.innerHTML=`
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
	  `,v())}function v(){const e=document.getElementById("registerForm"),t=document.getElementById("registerStatus");e==null||e.addEventListener("submit",async n=>{n.preventDefault();const s=document.getElementById("username").value,o=document.getElementById("email").value,r=document.getElementById("password").value,i={userName:s,email:o,password:r};try{t.innerHTML=`
		  <p class="text-blue-600">Creating account...</p>
		`;const l=window.location.origin,a=await fetch(`${l}/user/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)}),c=await a.json();if(!a.ok){let d=c.error||"Registration failed";t.innerHTML=`
			<p class="text-red-500">${d}</p>
		  `;return}t.innerHTML=`
		  <p class="text-green-500">Account created successfully! Redirecting to login...</p>
		`,setTimeout(()=>{history.pushState(null,"","/"),window.dispatchEvent(new PopStateEvent("popstate"))},2e3)}catch(l){console.error("Registration error:",l),t.innerHTML=`
		  <p class="text-red-500">An error occurred during registration. Please try again.</p>
		`}})}function w(){const e=document.getElementById("app");if(e){e.innerHTML=`
		<div class="flex flex-col items-center justify-center">
		  <div class="text-black font-jaro text-6xl mt-16">Erreur de connexion</div>
		  <p class="text-black mt-8">Une erreur s'est produite lors de la connexion avec Google.</p>
		  <button id="returnToLoginBtn" class="font-inria px-6 py-2 mt-8 border border-black rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
			Retour à la page de connexion
		  </button>
		</div>
	  `;const t=document.getElementById("returnToLoginBtn");t==null||t.addEventListener("click",()=>{history.pushState(null,"","/"),window.dispatchEvent(new PopStateEvent("popstate"))})}}function x(){const e=document.getElementById("app");if(e){const n=new URLSearchParams(window.location.search).get("token");n&&(localStorage.setItem("authToken",n),console.log("Token stocké:",n)),e.innerHTML=`
		<div class="flex flex-col items-center justify-center">
		  <div class="text-black font-jaro text-6xl mt-16">Connexion réussie</div>
		  <p class="text-black mt-8">Vous êtes maintenant connecté avec Google.</p>
		  <div id="redirectMessage" class="text-black mt-4">Redirection automatique dans 3 secondes...</div>
		</div>
	  `,setTimeout(()=>{history.pushState(null,"","/menu"),window.dispatchEvent(new PopStateEvent("popstate"))},3e3)}}function E(){const e=document.getElementById("app");if(e){e.innerHTML=`
	  <div class="text-black font-jaro text-9xl mt-16 mb-36">Pong Game</div>
	  <div class="flex flex-col justify-center items-center gap-6">
		<button id="PlayBtn" type="button" class="mb-2 text-6xl h-36 font-jaro w-1/2 border-black rounded-md text-white bg-red-600  hover:bg-red-700 hover:outline-none focus:outline-none">Play Game</button>
		<button id="profileBtn" type="button" class="text-6xl h-36 font-jaro w-1/2 border border-black rounded-md text-white  bg-blue-700 hover:bg-blue-800  hover:outline-none focus:outline-none">Profile</button>
		<button id="disconnectBtn" type="button" class="font-jaro w-1/8 h-12 mt-5 border border-black rounded-md font-medium text-white bg-black hover:bg-gray-900 focus:outline-none">disconnect</button>
	  </div>
	  `;const t=document.getElementById("PlayBtn");t==null||t.addEventListener("click",()=>{history.pushState(null,"","/mode"),window.dispatchEvent(new PopStateEvent("popstate"))});const n=document.getElementById("profileBtn");n==null||n.addEventListener("click",()=>{history.pushState(null,"","/profile"),window.dispatchEvent(new PopStateEvent("popstate"))});const s=document.getElementById("disconnectBtn");s==null||s.addEventListener("click",()=>{history.pushState(null,"","/"),window.dispatchEvent(new PopStateEvent("popstate"))})}}async function k(){const e=document.getElementById("app");if(!e)return;e.innerHTML=`
	  <div class="flex flex-col items-center justify-center min-h-screen">
		<h1 class="text-3xl font-bold mb-4">Lobby Matchmaking</h1>
		<p class="text-gray-700">Recherche des adversaires pour le tournoi...</p>
	  </div>
	`;const t=await u();if(console.log(t),!t){console.error("Aucun utilisateur connecté");return}const n=t.userId;console.log("currentPlayerId:",n)}const B={"/":h,"/profile":m,"/menu":E,"/mode":b,"/game":p,"/queue":g,"/queue_tournament":k,"/tournament":f,"/create_account":y,"/login_error":w,"/login_success":x};function P(){function e(){const t=window.location.pathname,n=B[t],s=document.getElementById("app");s&&n?(s.innerHTML="",n()):s.innerHTML="<h1>Page not found</h1>"}document.addEventListener("click",t=>{const n=t.target;if(n.tagName==="A"&&n.href&&n.getAttribute("data-link")!==null){t.preventDefault();const s=new URL(n.href);history.pushState(null,"",s.pathname),e()}}),window.addEventListener("popstate",e),e()}P();
