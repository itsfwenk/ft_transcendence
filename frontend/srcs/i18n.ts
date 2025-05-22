import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';

let isInitialized = false;
let initializationPromise: Promise<void>;

let initPromise: Promise<void> | null = null;

export function waitForI18n(): Promise<void> {
  if (i18next.isInitialized) {
    return Promise.resolve();
  }
  
  if (!initPromise) {
    initPromise = new Promise<void>((resolve, reject) => {
      i18next.on('initialized', () => {
        resolve();
      });
      
      i18next.on('failedInitialization', () => {
        console.error('❌ i18n initialization failed');
        reject(new Error('i18n initialization failed'));
      });
    });
  }
  
  return initPromise;
}

export const LANGUAGE_CHANGED_EVENT = 'i18n:languageChanged';

export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' }
];

export function t(key: string, options?: any): string {
  if (!isInitialized) {
    return key.split('.').pop() || key;
  }
  
  const translation = i18next.t(key, options);
  
  if (translation === key) {
    return key.split('.').pop() || key;
  }
  
  return translation as string;
}

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

function initializeI18n(): Promise<void> {
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = new Promise((resolve, reject) => {
    i18next
      .use(HttpBackend)
      .init({
        fallbackLng: 'en',
        lng: getDefaultLanguage(),
        debug: true,
        backend: {
          loadPath: '/locales/{{lng}}/{{ns}}.json'
        },
        interpolation: {
          escapeValue: false
        }
      })
      .then(() => {
        isInitialized = true;
        
        i18next.on('languageChanged', (lang) => {
          const event = new CustomEvent(LANGUAGE_CHANGED_EVENT, { detail: { language: lang } });
          document.dispatchEvent(event);
        });
        
        resolve();
      })
      .catch(error => {
        console.error('❌ i18n initialization failed:', error);
        reject(error);
      });
  });
  
  return initializationPromise;
}

export async function changeLanguage(langCode: string): Promise<void> {
  if (!supportedLanguages.some(lang => lang.code === langCode)) {
    console.error(`Language ${langCode} not supported`);
    return Promise.reject(new Error(`Language ${langCode} not supported`));
  }
  
  if (!isInitialized) {
    await initializeI18n();
  }
  
  localStorage.setItem('pongGameLanguage', langCode);
  await i18next.changeLanguage(langCode);
}

export function onLanguageChanged(callback: (lang: string) => void): () => void {
  const handler = (event: CustomEvent) => {
    callback(event.detail.language);
  };
  
  document.addEventListener(LANGUAGE_CHANGED_EVENT as any, handler as EventListener);
  
  return () => {
    document.removeEventListener(LANGUAGE_CHANGED_EVENT as any, handler as EventListener);
  };
}

initializeI18n();

export default i18next;