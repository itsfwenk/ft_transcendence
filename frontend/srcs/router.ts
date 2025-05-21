import Profile from './pages/profile';
import Game from './pages/game';
import Queue from './pages/queue';
import login from './pages/login';
import createAccount from './pages/createAccount';
import loginError from './pages/googleError';
import loginSuccess from './pages/googleSuccess';
import menu from './pages/menu';
import mode from './pages/mode';
import Queuetournament from './pages/queue_tournament';
import Tournament_mgt from './pages/tournament';
import Local from './pages/local';
import editProfile from './pages/editProfile';
import historyProfile from './pages/history';
import { waitForI18n } from './i18n';

// Définir vos routes sous forme d'un objet
const routes: { [key: string]: () => void } = {
  '/': login,
  '/profile': Profile,
  '/menu': menu,
  '/mode': mode,
  '/game': Game,
  '/local': Local,
  '/queue': Queue,
  '/queue_tournament': Queuetournament,
  '/tournament': Tournament_mgt,
  '/create_account': createAccount,
  '/login_error': loginError,
  '/login_success': loginSuccess,
  '/edit_profile': editProfile,
  '/history': historyProfile,
};

export function initRouter() {
  console.log("INIT ROUTER CALLED");

  waitForI18n().then(() => {
    function router() {
      const path = window.location.pathname;
      console.log("path :", path);
      const pageRenderer = routes[path];
      const app = document.getElementById('app');
      if (app && pageRenderer) {
        app.innerHTML = '';
        pageRenderer();
      } else {
        app!.innerHTML = '<h1>Page not found</h1>';
      }
    }
    
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === 'A' && target.href && target.getAttribute('data-link') !== null) {
        e.preventDefault();
        const url = new URL(target.href);
        history.pushState(null, '', url.pathname);
        console.log("ROUTER url.pathname :", url.pathname);
        router();
      }
    });
    
    window.addEventListener('popstate', router);
    
    router();
  }).catch(error => {
    console.error("Erreur lors de l'initialisation i18n:", error);
  });
}