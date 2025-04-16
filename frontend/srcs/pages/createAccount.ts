export default function createAccount() {
	const app = document.getElementById('app');
	if (app) {
	  app.innerHTML = /*html*/`
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
	  `;
  
	  setupEventListeners();
	}
  }
  
  function setupEventListeners() {
	const registerForm = document.getElementById('registerForm') as HTMLFormElement;
	const registerStatus = document.getElementById('registerStatus') as HTMLDivElement;
	
	registerForm?.addEventListener('submit', async (e) => {
	  e.preventDefault();
	  
	  const userName = (document.getElementById('username') as HTMLInputElement).value;
	  const email = (document.getElementById('email') as HTMLInputElement).value;
	  const password = (document.getElementById('password') as HTMLInputElement).value;
	  
	  const userData = {
		userName: userName,
		email: email,
		password: password
	  };
	  
	  try {
		registerStatus.innerHTML = `
		  <p class="text-blue-600">Creating account...</p>
		`;
		const baseUrl = window.location.origin;
		const response = await fetch(`${baseUrl}/user/register`, {
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json'
		  },
		  body: JSON.stringify(userData)
		});
		
		const data = await response.json();
		
		if (!response.ok) {
		  let errorMessage = data.error || 'Registration failed';
		  registerStatus.innerHTML = `
			<p class="text-red-500">${errorMessage}</p>
		  `;
		  return;
		}
		
		registerStatus.innerHTML = `
		  <p class="text-green-500">Account created successfully! Redirecting to login...</p>
		`;
		
		setTimeout(() => {
		  history.pushState(null, '', '/');
		  window.dispatchEvent(new PopStateEvent('popstate'));
		}, 2000);
		
	  } catch (error) {
		console.error('Registration error:', error);
		registerStatus.innerHTML = `
		  <p class="text-red-500">An error occurred during registration. Please try again.</p>
		`;
	  }
	});
  }