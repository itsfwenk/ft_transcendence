import Profile from './pages/profile';
import Menu from './pages/menu';
import Game from './pages/game';
import Queue from './pages/queue';
import login from './pages/login';
import createAccount from './pages/createAccount';
import loginError from './pages/googleError';
import loginSuccess from './pages/googleSuccess';

const routes: { [key: string]: () => void } = {
  '/': login,
  '/profile': Profile,
  '/menu': Menu,
  '/game': Game,
  '/queue': Queue,
  '/create_account': createAccount,
  '/login_error': loginError,
  '/login_success': loginSuccess,
};

export function initRouter() {
  function router() {
    const path = window.location.pathname;
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
      router();
    }
  });
  
  // Gérer la navigation via les boutons back/forward
  window.addEventListener('popstate', router);
  
  // Charger la route initiale
  router();
}