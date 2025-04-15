(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const l of r)if(l.type==="childList")for(const c of l.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&o(c)}).observe(document,{childList:!0,subtree:!0});function a(r){const l={};return r.integrity&&(l.integrity=r.integrity),r.referrerPolicy&&(l.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?l.credentials="include":r.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function o(r){if(r.ep)return;r.ep=!0;const l=a(r);fetch(r.href,l)}})();function x(){const e=document.getElementById("app");console.log("Module Home recharge"),e&&(e.innerHTML=`
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
    `,document.getElementById("loginForm").addEventListener("submit",async a=>{a.preventDefault();const o=document.getElementById("email").value,r=document.getElementById("password").value;try{const l=window.location.origin;console.log(`${l}/user/login`);const c=await fetch(`${l}/user/login`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:o,password:r})});if(!c.ok)throw new Error(`Erreur lors de la connexion: ${c.statusText}`);const i=await c.json();console.log("Réponse de login:",i),history.pushState(null,"","/menu"),window.dispatchEvent(new PopStateEvent("popstate"))}catch(l){console.error("Erreur de login:",l)}}))}function b(){const e=document.getElementById("app");e&&(e.innerHTML=`
        <div class="p-4">
          <h1 class="text-2xl font-bold">Mon Profil</h1>
          <!-- Contenu du profil ici -->
          <p>Information sur l'utilisateur...</p>
          <a href="/menu" data-link class="text-indigo-600 hover:underline">Retour au menu principal</a>
        </div>
      `)}async function m(){try{const e=window.location.origin,n=await fetch(`${e}/user/getProfile`,{method:"GET",credentials:"include",headers:{"Content-Type":"application/json"}});if(!n.ok)throw new Error(`Erreur lors de la récupération du profil: ${n.statusText}`);const a=await n.json();return console.log("Profil utilisateur:",a),a}catch(e){return console.error("Erreur de récupération du profil:",e),null}}function w(){const e=document.getElementById("app");e&&(e.innerHTML=`
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
		`,document.getElementById("localBtn").addEventListener("click",o=>{o.preventDefault(),console.log("local button clicked, navigating to /local"),console.log("before history pushState"),history.pushState(null,"","/local"),window.dispatchEvent(new PopStateEvent("popstate"))}),document.getElementById("onlineBtn").addEventListener("click",async o=>{o.preventDefault(),console.log("online button...");const r=await m();if(console.log(r),!r){console.error("Aucun utilisateur connecté");return}const l=r.userId;console.log("currentPlayerId:",l);try{const c=window.location.origin,i=await fetch(`${c}/matchmaking/join`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({playerId:l})});if(!i.ok)throw new Error(`Erreur lors du lancement de la page: ${i.statusText}`);const s=await i.json();console.log("Réponse de login:",s),history.pushState(null,"","/queue"),window.dispatchEvent(new PopStateEvent("popstate"))}catch(c){console.error("Erreur de login:",c)}}))}function v(){const e=document.getElementById("app");e&&(e.innerHTML=`
        <div class="flex flex-col items-center justify-center min-h-screen">
			<h1 class="text-3xl font-bold text-blue-600 mb-4">Lancer la partie</h1>
          <form id="loginForm" class="space-y-4">
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">lancer</button>
          </form>
          <p class="mt-4">
          </p>
        </div>
      `)}async function E(){const e=document.getElementById("app");if(!e)return;e.innerHTML=`
	  <div class="flex flex-col items-center justify-center min-h-screen">
		<h1 class="text-3xl font-bold mb-4">Lobby Matchmaking</h1>
		<p class="text-gray-700">Recherche d'un adversaire...</p>
	  </div>
	`;const n=await m();if(console.log(n),!n){console.error("Aucun utilisateur connecté");return}const a=n.userId;console.log("currentPlayerId:",a);const o=new WebSocket(`ws://localhost:4000/api-matchmaking/ws?playerId=${a}`);o.onopen=()=>{console.log("Connexion WebSocket établie")},o.onmessage=r=>{try{const l=JSON.parse(r.data);console.log("Notification WebSocket reçue:",l),l.gameSessionId&&(history.pushState(null,"",`/game?gameSessionId=${l.gameSessionId}`),window.dispatchEvent(new PopStateEvent("popstate")))}catch(l){console.error("Erreur lors du parsing du message:",l)}},o.onerror=r=>{console.error("Erreur WebSocket:",r)},o.onclose=()=>{console.log("Connexion WebSocket fermée")}}function I(){let e=document.getElementById("gameCanvas"),n=e.getContext("2d");if(!n)throw new Error("Failed to get 2D context");const a=10,o=80,r=5;let l=0,c=0,i={x:0,y:e.height/2-o/2,dy:0},s={x:e.width-10,y:e.height/2-o/2,dy:0},t={x:e.width/2,y:e.height/2,radius:7,dx:Math.random()>.5?3:-3,dy:Math.random()>.5?3:-3};document.addEventListener("keydown",d=>{d.key==="w"&&(i.dy=-5),d.key==="s"&&(i.dy=r),d.key==="ArrowUp"&&(s.dy=-5),d.key==="ArrowDown"&&(s.dy=r)}),document.addEventListener("keyup",d=>{(d.key==="w"||d.key==="s")&&(i.dy=0),(d.key==="ArrowUp"||d.key==="ArrowDown")&&(s.dy=0)});function f(){i.y+=i.dy,s.y+=s.dy,i.y=Math.max(0,Math.min(e.height-o,i.y)),s.y=Math.max(0,Math.min(e.height-o,s.y)),t.y-t.radius<=0?(t.dy*=-1,t.y+=3):t.y+t.radius>=e.height&&(t.dy*=-1,t.y-=3);const d=1.1;if(t.x-t.radius<=i.x+a&&t.y>=i.y&&t.y<=i.y+o){let u=(t.y-(i.y+o/2))/(o/2);t.dx*=-1,t.dy=u*Math.abs(t.dx),t.x+=2,t.dx*=d,t.dy*=d}if(t.x+t.radius>=s.x&&t.y>=s.y&&t.y<=s.y+o){let u=(t.y-(s.y+o/2))/(o/2);t.dx*=-1,t.dy=u*Math.abs(t.dx),t.x-=2,t.dx*=d,t.dy*=d}t.x+=t.dx,t.y+=t.dy,t.x<0?(c++,y()):t.x>e.width&&(l++,y());function y(){t.x=e.width/2,t.y=e.height/2,t.dx=Math.random()>.5?3:-3,t.dy=Math.random()>.5?3:-3}}function h(){n&&(n.clearRect(0,0,e.width,e.height),n.fillStyle="blue",n.fillRect(i.x,i.y,a,o),n.fillStyle="red",n.fillRect(s.x,s.y,a,o),n.beginPath(),n.arc(t.x,t.y,t.radius,0,Math.PI*2),n.fillStyle="black",n.fill(),n.closePath(),n.fillStyle="black",n.font="20px Arial",n.textAlign="center",n.textBaseline="top",n.fillText(`${l}`,e.width/4,30),n.fillText(`${c}`,e.width*3/4,30))}function p(){f(),h(),requestAnimationFrame(p)}p()}function P(){var n;const e=document.getElementById("app");e&&(e.innerHTML=`
      <div class="flex flex-col items-center">
        <h1 class="text-3xl font-bold text-black p-2">Local Game</h1>
        <canvas id="gameCanvas" width="800" height="400" class="mx-auto block border-8 border-gray-500 bg-white-700"></canvas>
        <div class="mt-4 space-x-2">
          <button id="pauseLocalBtn" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Pause</button>
          <a href="/" data-link class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Home</a>
        </div>
      </div>
    `,(n=document.getElementById("pauseLocalBtn"))==null||n.addEventListener("click",()=>{alert("Game paused. Click OK to resume.")}),setTimeout(()=>{I()},0))}const S={"/":x,"/profile":b,"/menu":w,"/game":v,"/local":P,"/queue":E};function k(){function e(){const n=window.location.pathname,a=S[n],o=document.getElementById("app");o&&a?(o.innerHTML="",a()):o.innerHTML="<h1>Page not found</h1>"}document.addEventListener("click",n=>{const a=n.target;if(a.tagName==="A"&&a.href&&a.getAttribute("data-link")!==null){n.preventDefault();const o=new URL(a.href);history.pushState(null,"",o.pathname),e()}}),window.addEventListener("popstate",e),e()}k();
