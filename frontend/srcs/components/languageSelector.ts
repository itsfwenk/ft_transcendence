// srcs/components/LanguageSelector.ts
import i18next, { changeLanguage, supportedLanguages } from "../i18n";

export function createLanguageSelector(): HTMLElement {
	const container = document.createElement("div");
	container.className = "flex justify-end mb-4";

	const selectorContainer = document.createElement("div");
	selectorContainer.className = "relative group";

	const dropdown = document.createElement("select");
	dropdown.id = "language-selector";
	dropdown.className =
		"appearance-none bg-blue-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 pr-8 cursor-pointer transition-colors duration-200 hover:bg-blue-700";

	function updateOptions() {
		dropdown.innerHTML = "";

		supportedLanguages.forEach((lang) => {
			const option = document.createElement("option");
			option.value = lang.code;
			option.textContent = lang.name;
			option.selected = i18next.language === lang.code;
			dropdown.appendChild(option);
		});
	}

	updateOptions();

	dropdown.addEventListener("change", (event) => {
		const target = event.target as HTMLSelectElement;
		changeLanguage(target.value);
	});

	const arrowContainer = document.createElement("div");
	arrowContainer.className =
		"pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white";
	arrowContainer.innerHTML = `
    <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
    </svg>
  `;

	selectorContainer.appendChild(dropdown);
	selectorContainer.appendChild(arrowContainer);
	container.appendChild(selectorContainer);

	return container;
}

export function addLanguageSelectorTo(element: HTMLElement): void {
	const selector = createLanguageSelector();
	element.prepend(selector);
}
