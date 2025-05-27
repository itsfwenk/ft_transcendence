import i18n from '../i18n';

export default function createAccount() {
	const app = document.getElementById('app');
	if (app) {
	  app.innerHTML = /*html*/`
		<div class="text-black font-jaro text-9xl mt-16 mb-28 select-none">${i18n.t('general.pongGame')}</div>
		<form id="registerForm" class="flex flex-col gap-6 justify-center items-center">
        
			<input id="username" type="username" id="username" name="username" placeholder="${i18n.t('login.username')}" required class="shadow-md h-25 pl-6 w-120 bg-white border border-black font-jaro text-black text-2xl rounded-md focus:outline-none">

			<input id="email" type="email" id="email" name="email" placeholder="${i18n.t('login.email')}" required class="shadow-md h-25 pl-6 w-120 bg-white border border-black font-jaro text-black text-2xl rounded-md focus:outline-none">

			<input id="password" type="password" id="password" name="password" placeholder="${i18n.t('login.password')}" required class="shadow-md h-25 pl-6 w-120 bg-white border border-black font-jaro text-black text-2xl rounded-md focus:outline-none">
			
            <div id="createAccountSubmitBtn" class="button font-jaro mt-4 w-60 h-14 bg-blue-700 rounded-lg cursor-pointer select-none
                        hover:translate-y-[15px]  hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
                        hover:border-b-[0px]
                        transition-all duration-150 [box-shadow:0_10px_0_0_#193cb8,0_15px_0_0_#1b70f841]
                        border-b-[1px] border-blue-400 hover:outline-none focus:outline-none">
                <span class='flex flex-col justify-center items-center h-full text-white font-jaro text-3xl'>${i18n.t('login.createAccount')}</span>
            </div>

		</form>
		<div id="registerStatus" class="mt-4 font-jaro items-center justify-center"></div>
		<div class="mt-12 flex justify-center">
			<div id="backToLoginBtn" class='button w-32 h-10 bg-gray-700 rounded-full cursor-pointer select-none
				hover:translate-y-[15px] hover:[box-shadow:0_0px_0_0_#000000,0_0px_0_0_#00000041]
				hover:border-b-[0px]
				transition-all duration-150 [box-shadow:0_10px_0_0_#000000,0_15px_0_0_#00000041]
				border-b-[1px] border-gray-400'>
				<span class='flex flex-col justify-center items-center h-full text-white font-jaro text-base'>${i18n.t('login.backLog')}</span>
			</div>
		</div>
	  `;
  
	  setupEventListeners();
	}
  }

async function handleRegistrationSubmit(e?: Event) {
    e?.preventDefault(); 

    const userName = (document.getElementById('username') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    
    const userData = {
        userName: userName,
        email: email,
        password: password
    };
    
    const registerStatus = document.getElementById('registerStatus') as HTMLDivElement;
    
    try {
        registerStatus.innerHTML = `
            <p class="text-blue-600 font-jaro">Creating account...</p>
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
                <p class="text-red-500 font-jaro">${errorMessage}</p>
            `;
            return;
        }
        
        registerStatus.innerHTML = /*html*/ `
            <p class="text-green-500 font-jaro">${i18n.t('logTrue')}</p>
        `;
        
        setTimeout(() => {
            history.pushState(null, '', '/');
            window.dispatchEvent(new PopStateEvent('popstate'));
        }, 2000);
        
    } catch (error) {
        console.error('Registration error:', error);
        registerStatus.innerHTML = /*html*/`
            <p class="text-red-500 font-jaro">An error occurred during registration. Please try again.</p>
        `;
    }
}


function setupEventListeners() {
    const registerForm = document.getElementById('registerForm') as HTMLFormElement;
    const createAccountSubmitBtn = document.getElementById('createAccountSubmitBtn');
    const backToLoginBtn = document.getElementById('backToLoginBtn');

    registerForm?.addEventListener('submit', handleRegistrationSubmit);

    createAccountSubmitBtn?.addEventListener('click', handleRegistrationSubmit);

    backToLoginBtn?.addEventListener('click', () => {
        history.pushState(null, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
    });
}

//   function setupEventListeners() {
// 	const registerForm = document.getElementById('registerForm') as HTMLFormElement;
// 	const registerStatus = document.getElementById('registerStatus') as HTMLDivElement;
// 	const backToLoginBtn = document.getElementById('backToLoginBtn');
	
// 	registerForm?.addEventListener('submit', async (e) => {
// 	  e.preventDefault();
	  
// 	  const userName = (document.getElementById('username') as HTMLInputElement).value;
// 	  const email = (document.getElementById('email') as HTMLInputElement).value;
// 	  const password = (document.getElementById('password') as HTMLInputElement).value;
	  
// 	  const userData = {
// 		userName: userName,
// 		email: email,
// 		password: password
// 	  };
	  
// 	  try {
// 		registerStatus.innerHTML = `
// 		  <p class="text-blue-600 font-jaro">Creating account...</p>
// 		`;
// 		const baseUrl = window.location.origin;
// 		const response = await fetch(`${baseUrl}/user/register`, {
// 		  method: 'POST',
// 		  headers: {
// 			'Content-Type': 'application/json'
// 		  },
// 		  body: JSON.stringify(userData)
// 		});
		
// 		const data = await response.json();
		
// 		if (!response.ok) {
// 		  let errorMessage = data.error || 'Registration failed';
// 		  registerStatus.innerHTML = `
// 			<p class="text-red-500 font-jaro">${errorMessage}</p>
// 		  `;
// 		  return;
// 		}
		
// 		registerStatus.innerHTML = /*html*/ `
// 		  <p class="text-green-500 font-jaro">${i18n.t('logTrue')}</p>
// 		`;
		
// 		setTimeout(() => {
// 		  history.pushState(null, '', '/');
// 		  window.dispatchEvent(new PopStateEvent('popstate'));
// 		}, 2000);
		
// 	  } catch (error) {
// 		console.error('Registration error:', error);
// 		registerStatus.innerHTML = /*html*/`
// 		  <p class="text-red-500 font-jaro">An error occurred during registration. Please try again.</p>
// 		`;
// 	  }
// 	});

// 	backToLoginBtn?.addEventListener('click', () => {
//         history.pushState(null, '', '/');
//         window.dispatchEvent(new PopStateEvent('popstate'));
//     });
//   }