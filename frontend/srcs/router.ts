import Home from './pages/home';
import Profile from './pages/profile';
import Menu from './pages/menu';
import Game from './pages/game';
import Queue from './pages/queue';
import Queuetournament from './pages/queue_tournament';
import Tournament_mgt from './pages/tournament';
import Local from './pages/local';

// Définir vos routes sous forme d'un objet
const routes: { [key: string]: () => void } = {
  '/': Home,
  '/profile': Profile,
  '/menu': Menu,
  '/game': Game,
  '/local': Local,
  '/queue': Queue,
  '/queue_tournament': Queuetournament,
  '/tournament': Tournament_mgt,
};

export function initRouter() {
  // Fonction pour charger la page en fonction du path
  function router() {
    const path = window.location.pathname;
    const pageRenderer = routes[path];
    const app = document.getElementById('app');
    if (app && pageRenderer) {
      // Le contenu de la page est généré par la fonction correspondante
      app.innerHTML = '';
      pageRenderer();
    } else {
      // Si la route n'existe pas, afficher une page 404
      app!.innerHTML = '<h1>Page not found</h1>';
    }
  }
  
  // Intercepter les clics sur les liens internes
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