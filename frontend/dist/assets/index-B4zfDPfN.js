(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function l(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(r){if(r.ep)return;r.ep=!0;const a=l(r);fetch(r.href,a)}})();function w(){const t=document.getElementById("app");console.log("Module Home recharge"),t&&(t.innerHTML=`
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
      `,document.getElementById("loginForm").addEventListener("submit",async l=>{l.preventDefault();const o=document.getElementById("email").value,r=document.getElementById("password").value;try{const a=window.location.origin;console.log(`${a}/user/login`);const s=await fetch(`${a}/user/login`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:o,password:r})});if(!s.ok)throw new Error(`Erreur lors de la connexion: ${s.statusText}`);const i=await s.json();console.log("Réponse de login:",i),history.pushState(null,"","/menu"),window.dispatchEvent(new PopStateEvent("popstate"))}catch(a){console.error("Erreur de login:",a)}}))}function v(){const t=document.getElementById("app");t&&(t.innerHTML=`
        <div class="p-4">
          <h1 class="text-2xl font-bold">Mon Profil</h1>
          <!-- Contenu du profil ici -->
          <p>Information sur l'utilisateur...</p>
          <a href="/menu" data-link class="text-indigo-600 hover:underline">Retour au menu principal</a>
        </div>
      `)}async function f(){try{const t=window.location.origin,n=await fetch(`${t}/user/getProfile`,{method:"GET",credentials:"include",headers:{"Content-Type":"application/json"}});if(!n.ok)throw new Error(`Erreur lors de la récupération du profil: ${n.statusText}`);const l=await n.json();return console.log("Profil utilisateur:",l),l}catch(t){return console.error("Erreur de récupération du profil:",t),null}}function E(){const t=document.getElementById("app");t&&(t.innerHTML=`
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
		`,document.getElementById("localBtn").addEventListener("click",async o=>{o.preventDefault(),console.log("local button...");try{const r=window.location.origin,a=await fetch(`${r}/game/start`,{method:"POST"});if(!a.ok)throw new Error(`Erreur lors du lancement de la page: ${a.statusText}`);const s=await a.json();console.log("Réponse de login:",s),history.pushState(null,"","/game"),window.dispatchEvent(new PopStateEvent("popstate"))}catch(r){console.error("Erreur de login:",r)}}),document.getElementById("onlineBtn").addEventListener("click",async o=>{o.preventDefault(),console.log("online button...");const r=await f();if(console.log(r),!r){console.error("Aucun utilisateur connecté");return}const a=r.userId;console.log("currentPlayerId:",a);try{const s=window.location.origin,i=await fetch(`${s}/matchmaking/join`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({playerId:a})});if(!i.ok)throw new Error(`Erreur lors du lancement de la page: ${i.statusText}`);const c=await i.json();console.log("Réponse de login:",c),history.pushState(null,"","/queue"),window.dispatchEvent(new PopStateEvent("popstate"))}catch(s){console.error("Erreur de login:",s)}}))}function P(){alert("Game paused. Click OK to resume.")}function m(){let t=document.getElementById("gameCanvas"),n=t.getContext("2d");if(!n)throw new Error("Failed to get 2D context");const l=10,o=80,r=5;let a=0,s=0,i={x:0,y:t.height/2-o/2,dy:0},c={x:t.width-10,y:t.height/2-o/2,dy:0},e={x:t.width/2,y:t.height/2,radius:7,dx:Math.random()>.5?3:-3,dy:Math.random()>.5?3:-3};document.addEventListener("keydown",d=>{d.key==="w"&&(i.dy=-5),d.key==="s"&&(i.dy=r),d.key==="ArrowUp"&&(c.dy=-5),d.key==="ArrowDown"&&(c.dy=r)}),document.addEventListener("keyup",d=>{(d.key==="w"||d.key==="s")&&(i.dy=0),(d.key==="ArrowUp"||d.key==="ArrowDown")&&(c.dy=0)});function g(){i.y+=i.dy,c.y+=c.dy,i.y=Math.max(0,Math.min(t.height-o,i.y)),c.y=Math.max(0,Math.min(t.height-o,c.y)),e.y-e.radius<=0?(e.dy*=-1,e.y+=3):e.y+e.radius>=t.height&&(e.dy*=-1,e.y-=3);const d=1.1;if(e.x-e.radius<=i.x+l&&e.y>=i.y&&e.y<=i.y+o){let u=(e.y-(i.y+o/2))/(o/2);e.dx*=-1,e.dy=u*Math.abs(e.dx),e.x+=2,e.dx*=d,e.dy*=d}if(e.x+e.radius>=c.x&&e.y>=c.y&&e.y<=c.y+o){let u=(e.y-(c.y+o/2))/(o/2);e.dx*=-1,e.dy=u*Math.abs(e.dx),e.x-=2,e.dx*=d,e.dy*=d}e.x+=e.dx,e.y+=e.dy,e.x<0?(s++,y()):e.x>t.width&&(a++,y());function y(){e.x=t.width/2,e.y=t.height/2,e.dx=Math.random()>.5?3:-3,e.dy=Math.random()>.5?3:-3}}function x(){n&&(n.clearRect(0,0,t.width,t.height),n.fillStyle="blue",n.fillRect(i.x,i.y,l,o),n.fillStyle="red",n.fillRect(c.x,c.y,l,o),n.beginPath(),n.arc(e.x,e.y,e.radius,0,Math.PI*2),n.fillStyle="black",n.fill(),n.closePath(),n.fillStyle="black",n.font="20px Arial",n.textAlign="center",n.textBaseline="top",n.fillText(`${a}`,t.width/4,30),n.fillText(`${s}`,t.width*3/4,30))}function p(){g(),x(),requestAnimationFrame(p)}p()}m();function h(){var n;const t=document.getElementById("app");t&&(t.innerHTML=`
      <div class="flex flex-col items-center">
        <h1 class="text-3xl font-bold text-black p-2">Local Game</h1>
        <canvas id="gameCanvas" width="800" height="400" class="mx-auto block border-8 border-gray-500 bg-white-700"></canvas>
        <div class="mt-4 space-x-2">
          <button id="pauseBtn" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Pause</button>
          <a href="/" data-link class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Home</a>
        </div>
      </div>
    `,(n=document.getElementById("pauseBtn"))==null||n.addEventListener("click",P),m())}async function I(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
	  <div class="flex flex-col items-center justify-center min-h-screen">
		<h1 class="text-3xl font-bold mb-4">Lobby Matchmaking</h1>
		<p class="text-gray-700">Recherche d'un adversaire...</p>
	  </div>
	`;const n=await f();if(console.log(n),!n){console.error("Aucun utilisateur connecté");return}const l=n.userId;console.log("currentPlayerId:",l);const o=new WebSocket(`ws://localhost:4000/api-matchmaking/ws?playerId=${l}`);o.onopen=()=>{console.log("Connexion WebSocket établie")},o.onmessage=r=>{try{const a=JSON.parse(r.data);console.log("Notification WebSocket reçue:",a),a.gameSessionId&&(history.pushState(null,"",`/game?gameSessionId=${a.gameSessionId}`),window.dispatchEvent(new PopStateEvent("popstate")))}catch(a){console.error("Erreur lors du parsing du message:",a)}},o.onerror=r=>{console.error("Erreur WebSocket:",r)},o.onclose=()=>{console.log("Connexion WebSocket fermée")}}const S={"/":w,"/profile":v,"/menu":E,"/game":h,"/queue":I,"/local":h};function k(){function t(){const n=window.location.pathname,l=S[n],o=document.getElementById("app");o&&l?(o.innerHTML="",l()):o.innerHTML="<h1>Page not found</h1>"}document.addEventListener("click",n=>{const l=n.target;if(l.tagName==="A"&&l.href&&l.getAttribute("data-link")!==null){n.preventDefault();const o=new URL(l.href);history.pushState(null,"",o.pathname),t()}}),window.addEventListener("popstate",t),t()}k();
