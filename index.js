// ============================================================
//  src/index.js
//  Worker principal pour intheroomsociety
//
//  Ce script fait 2 choses :
//  1. Si l'URL est /telegram → appelle CallMeBot (proxy serveur)
//  2. Sinon → sert les fichiers statiques du site (HTML, CSS, JS, images...)
// ============================================================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── ROUTE 1 : /telegram → proxy vers CallMeBot ──
    if (url.pathname === '/telegram') {

      // Méthode POST (utilisée par admin.html)
      if (request.method === 'POST') {
        try {
          const { user, text } = await request.json();

          if (!user || !text) {
            return new Response(
              JSON.stringify({ success: false, error: "Paramètres 'user' et 'text' requis" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          const apiUrl = `https://api.callmebot.com/text.php?user=${encodeURIComponent(user)}&text=${encodeURIComponent(text)}`;
          const reponse = await fetch(apiUrl);
          const resultatTexte = await reponse.text();

          return new Response(
            JSON.stringify({ success: true, result: resultatTexte }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );

        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      // Méthode GET → pour tester facilement dans le navigateur
      // Exemple : /telegram?user=@KYM_999&text=Test
      if (request.method === 'GET') {
        const user = url.searchParams.get('user');
        const text = url.searchParams.get('text');

        if (!user || !text) {
          return new Response(
            "Utilisation : /telegram?user=@TonPseudo&text=TonMessage",
            { status: 400 }
          );
        }

        const apiUrl = `https://api.callmebot.com/text.php?user=${encodeURIComponent(user)}&text=${encodeURIComponent(text)}`;
        const reponse = await fetch(apiUrl);
        const resultatTexte = await reponse.text();

        return new Response(resultatTexte, { status: 200 });
      }
    }

    // ── ROUTE 2 : Tout le reste → servir les fichiers statiques (accueil.html, paie.html, images...) ──
    return env.ASSETS.fetch(request);
  }
};
