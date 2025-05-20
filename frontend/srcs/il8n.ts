// srcs/i18n.ts
import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';

export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' }
];

// Initialisation de i18next
i18n
  .use(HttpBackend)
  .init({
    fallbackLng: 'en',
    lng: getDefaultLanguage(),
    debug: false,
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    interpolation: {
      escapeValue: false
    }
  });

function getDefaultLanguage(): string {
  const savedLanguage = localStorage.getItem('pongGameLanguage');
  
  if (savedLanguage && supportedLanguages.some(lang => lang.code === savedLanguage)) {
    return savedLanguage;
  }
  
  const browserLang = navigator.language.split('-')[0];
  
  if (supportedLanguages.some(lang => lang.code === browserLang)) {
    return browserLang;
  }
  
  return 'en';
}

export function changeLanguage(langCode: string): Promise<void> {
  if (!supportedLanguages.some(lang => lang.code === langCode)) {
    console.error(`Language ${langCode} not supported`);
    return Promise.reject(new Error(`Language ${langCode} not supported`));
  }
  
  localStorage.setItem('pongGameLanguage', langCode);
  return i18n.changeLanguage(langCode);
}

// Fonction pour traduire un texte
export function t(key: string, options?: any): string {
  return i18n.t(key, options);
}

// Exporter l'instance i18n pour une utilisation directe si nécessaire
export default i18n;