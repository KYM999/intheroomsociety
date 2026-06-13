// ============================================================
//  src/index.js
//  Worker principal pour intheroomsociety
// ============================================================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── ROUTE 1 : /telegram → proxy vers CallMeBot ──
    if (url.pathname === '/telegram') {
      
      // Configuration des en-têtes CORS pour autoriser ton site à interroger le Worker
      const corsHeaders = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Permet les requêtes depuis n'importe quel domaine (indispensable si ton admin.html est sur Pages)
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      };

      // Gérer la requête de pré-vérification (OPTIONS) envoyée automatiquement par les navigateurs
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Méthode POST (utilisée par acceptation.html)
      if (request.method === 'POST') {
        try {
          const { user, text } = await request.json();

          if (!user || !text) {
            return new Response(
              JSON.stringify({ success: false, error: "Paramètres 'user' et 'text' requis" }),
              { status: 400, headers: corsHeaders }
            );
          }

          const apiUrl = `https://api.callmebot.com/text.php?user=${encodeURIComponent(user)}&text=${encodeURIComponent(text)}`;
          const reponse = await fetch(apiUrl);
          const resultatTexte = await reponse.text();

          return new Response(
            JSON.stringify({ success: true, result: resultatTexte }),
            { status: 200, headers: corsHeaders }
          );

        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 500, headers: corsHeaders }
          );
        }
      }

      // Méthode GET → pour tester facilement dans le navigateur
      if (request.method === 'GET') {
        const user = url.searchParams.get('user');
        const text = url.searchParams.get('text');

        if (!user || !text) {
          return new Response(
            "Utilisation : /telegram?user=@TonPseudo&text=TonMessage",
            { status: 400, headers: corsHeaders }
          );
        }

        const apiUrl = `https://api.callmebot.com/text.php?user=${encodeURIComponent(user)}&text=${encodeURIComponent(text)}`;
        const reponse = await fetch(apiUrl);
        const resultatTexte = await reponse.text();

        return new Response(resultatTexte, { 
          status: 200, 
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders } 
        });
      }
    }

    // ── ROUTE 2 : Tout le reste → servir les fichiers statiques (accueil.html, images...) ──
    return env.ASSETS.fetch(request);
  }
};