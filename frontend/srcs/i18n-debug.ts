export async function debugI18nInDocker() {
  console.log("=== DEBUG I18N IN DOCKER ===");
  
  // Tester plusieurs chemins de fichiers
  const paths = [
    '/locales/en/translation.json',
    '/public/locales/en/translation.json',
    './locales/en/translation.json',
    '../locales/en/translation.json',
    '/app/locales/en/translation.json',
    '/app/public/locales/en/translation.json',
    '/dist/locales/en/translation.json',
    '/usr/share/nginx/html/locales/en/translation.json'
  ];
  
  console.log("🔍 Vérification des chemins d'accès aux fichiers de traduction");
  
  // Tester chaque chemin
  for (const path of paths) {
    try {
      const response = await fetch(path, { 
        method: 'GET',
        cache: 'no-cache',
        headers: { 'Accept': 'application/json' }
      });
      
      console.log(`${response.ok ? '✅' : '❌'} ${path}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        try {
          const content = await response.json();
          console.log(`   📄 Contenu vérifié: ${Object.keys(content).length} clés trouvées`);
        } catch (e) {
          console.log(`   ⚠️ Le fichier existe mais n'est pas un JSON valide`);
        }
      }
    } catch (error) {
      console.log(`❌ ${path}: Erreur réseau`, error);
    }
  }
  
  // Afficher le chemin de base de l'application
  console.log("📂 BASE_URL:", import.meta.env.BASE_URL);
  console.log("📂 URL courante:", window.location.href);
  console.log("📂 Origin:", window.location.origin);

  // Afficher les variables d'environnement Vite disponibles
  console.log("🌐 Variables d'environnement Vite:");
  for (const key in import.meta.env) {
    console.log(`   ${key}:`, import.meta.env[key]);
  }
  
  console.log("=== FIN DEBUG I18N ===");
}