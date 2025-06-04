import { matchmakingWebSocket } from "../wsClient";
import { fetchUserProfile } from "./mode";
import i18n from "../i18n";

export default async function login() {
	const baseUrl = window.location.origin;
	const app = document.getElementById("app");
	if (app) {
		app.innerHTML = /*html*/ `
        <div class="text-black font-jaro text-9xl mt-16 select-none">${i18n.t(
			"general.pongGame"
		)}</div>
        
        <form id="loginForm" class="flex flex-col items-center gap-6">
				<input type="email" id="email" name="email" placeholder="${i18n.t(
					"login.email"
				)}" required 
					class="mt-35 h-18 pl-6 w-100 bg-white border border-black text-black text-2xl rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md font-jaro">
				<input type="password" id="password" name="password" placeholder="${i18n.t(
					"login.password"
				)}" required 
					class="h-18 pl-6 w-100 bg-white border border-black text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md font-jaro text-2xl">
            
            <div id="loginSubmitBtn"
                    class="button font-jaro mt-4 w-60 h-14 bg-blue-700 rounded-lg cursor-pointer select-none
                        hover:translate-y-[12px]  hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
                        hover:border-b-[0px]
                        transition-all duration-150 [box-shadow:0_10px_0_0_#193cb8,0_15px_0_0_#1b70f841]
                        border-b-[1px] border-blue-400 hover:outline-none focus:outline-none"
                    data-shadow-main="#193cb8"
                    data-shadow-accent="#1b70f841"
                    data-border-color="#60A5FA"
            >
                <span class='flex flex-col justify-center items-center h-full text-white font-jaro text-3xl'>${i18n.t(
					"login.login"
				)}</span>
            </div>

        </form>
        
        <div id="errorMessage" class="text-red-500 mt-6 invisible opacity-0 font-jaro">${i18n.t(
			"login.errorLogin"
		)}</div>


        <div class="flex justify-center items-center gap-4 mt-6">
            <div id="createAccountBtn" 
                    class="button font-jaro w-80 h-16 bg-red-600 rounded-lg cursor-pointer select-none
                        hover:translate-y-[12px]  hover:[box-shadow:0_0px_0_0_#A31F1F,0_0px_0_0_#A31F1F41]
                        hover:border-b-[0px]
                        transition-all duration-150 [box-shadow:0_10px_0_0_#A31F1F,0_15px_0_0_#A31F1F41]
                        border-b-[1px] border-red-400 hover:outline-none focus:outline-none"
                    data-shadow-main="#991B1B"
                    data-shadow-accent="#EF444441"
                    data-border-color="#F87171"
            >
                <span class='flex flex-col justify-center items-center h-full text-white font-jaro text-3xl'>${i18n.t(
					"login.createAccount"
				)}</span>
            </div>
            
             <div class="text-black mt-6 my-4 font-jaro text-xl">${i18n.t(
					"login.or"
				)}</div>

            <div id="googleLoginBtn" 
                class="button font-jaro w-80 h-16 bg-white rounded-lg cursor-pointer select-none
                    hover:translate-y-[12px] hover:[box-shadow:0_0px_0_0_var(--shadow-main-color),0_0px_0_0_var(--shadow-accent-color)]
                    hover:border-b-[0px]
                    transition-all duration-150 [box-shadow:0_10px_0_0_var(--shadow-main-color),0_15px_0_0_var(--shadow-accent-color)]
                    border-b-[1px] border-[#dadce0] hover:outline-none focus:outline-none 
                    flex items-center px-6"
                data-shadow-main="#a0a0a0"
                data-shadow-accent="#e0e0e041"
                data-border-color="#dadce0"
            >
                <img src="./images/Google_Favicon.svg" alt="G" class="h-8 w-8">
                <span class='text-[#3c4043] font-jaro text-3xl flex-grow text-center pr-8'>Google</span> 
            </div>
        </div>
      `;

		const loginForm = document.getElementById(
			"loginForm"
		) as HTMLFormElement;
		const errorMessage = document.getElementById(
			"errorMessage"
		) as HTMLDivElement;
		const loginSubmitBtn = document.getElementById("loginSubmitBtn");

		function setButtonThemeVars(button: HTMLElement) {
			const shadowMain = button.dataset.shadowMain || "#000000";
			const shadowAccent = button.dataset.shadowAccent || "#00000041";
			const borderColor = button.dataset.borderColor || "#4D4D4D";

			button.style.setProperty("--shadow-main-color", shadowMain);
			button.style.setProperty("--shadow-accent-color", shadowAccent);
			button.style.setProperty("--border-color", borderColor);
		}

		const style = document.createElement("style");
		style.innerHTML = `
          .button {
              position: relative;
              transition: all 150ms ease-out;
          }

          .is-active {
              transform: translateY(0px) !important;
              box-shadow: 0 0px 0 0 var(--shadow-main-color), 0 0px 0 0 var(--shadow-accent-color) !important;
              border-bottom-width: 0 !important;
              border-bottom-style: none !important;
              filter: brightness(0.9);
              transition: none;
              outline: none !important; 
          }
      `;
		document.head.appendChild(style);

		const allButtons = document.querySelectorAll(".button");
		allButtons.forEach((btn) => {
			setButtonThemeVars(btn as HTMLElement);
		});

		loginForm.addEventListener("submit", async (e) => {
			e.preventDefault();

			errorMessage.classList.add("invisible", "opacity-0");

			const email = (document.getElementById("email") as HTMLInputElement)
				.value;
			const password = (
				document.getElementById("password") as HTMLInputElement
			).value;

			try {
				const response = await fetch(`${baseUrl}/user/login`, {
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ email, password }),
				});

				if (!response.ok) {
					const errorBody = await response.json();
					throw new Error(errorBody.error);
				}

				const data = await response.json();
				console.log("Réponse de login:", data);

				const profile = await fetchUserProfile();
				if (profile && profile.userId) {
					localStorage.setItem("userId", profile.userId);
					console.log("googleUserId", profile.userId);
					matchmakingWebSocket(profile.userId);
				} else {
					console.error(i18n.t("login.profileError"));
				}
				history.pushState(null, "", "/menu");
				window.dispatchEvent(new PopStateEvent("popstate"));
			} catch (error) {
				console.error(`${i18n.t("login.loginError")}:`, error);
				errorMessage.classList.remove("invisible", "opacity-0");
			}
		});

		loginSubmitBtn?.addEventListener("click", () => {
			loginForm.dispatchEvent(
				new Event("submit", { cancelable: true, bubbles: true })
			);
		});

		allButtons.forEach((btn) => {
			btn.addEventListener("mousedown", () => {
				btn.classList.add("is-active");
			});
			btn.addEventListener("mouseup", () => {
				btn.classList.remove("is-active");
			});
			btn.addEventListener("mouseleave", () => {
				btn.classList.remove("is-active");
			});
		});

		const createAccountBtn = document.getElementById("createAccountBtn");
		createAccountBtn?.addEventListener("click", () => {
			history.pushState(null, "", "/create_account");
			window.dispatchEvent(new PopStateEvent("popstate"));
		});

		const googleLoginBtn = document.getElementById("googleLoginBtn");
		googleLoginBtn?.addEventListener("click", () => {
			const baseUrl = window.location.origin;
			window.location.href = `${baseUrl}/user/auth/google`;
		});
	}
}
