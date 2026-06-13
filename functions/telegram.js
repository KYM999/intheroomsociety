// ============================================================
//  functions/telegram.js
//  Cloudflare Pages Function — proxy pour CallMeBot (Telegram)
//
//  Cette fonction tourne sur les serveurs Cloudflare (pas dans
//  le navigateur du client), donc :
//  - Aucun problème de CORS
//  - Aucun bloqueur de pub ne peut l'intercepter
//  - Pas besoin de corsproxy.io
//
//  Elle sera accessible automatiquement à l'URL :
//  https://intheroomsociety.kym999.workers.dev/telegram
// ============================================================

export async function onRequestPost(context) {
  try {
    // Récupérer les données envoyées par admin.html (user + message)
    const { user, text } = await context.request.json();

    if (!user || !text) {
      return new Response(
        JSON.stringify({ success: false, error: "Paramètres 'user' et 'text' requis" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Construire l'URL CallMeBot
    const apiUrl = `https://api.callmebot.com/text.php?user=${encodeURIComponent(user)}&text=${encodeURIComponent(text)}`;

    // Appeler CallMeBot DEPUIS le serveur Cloudflare (pas depuis le navigateur)
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

// ── Répondre aussi aux requêtes GET pour tester facilement dans le navigateur ──
// Exemple : /telegram?user=@KYM_999&text=Test
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
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
