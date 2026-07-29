// ============================================================
// GROK API — vérification du lien/nom TikTok envoyé par le client
// ============================================================

const API_URL = "https://api.x.ai/v1/chat/completions";

async function verifyTikTokLink(input) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROK_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "grok-4",
      messages: [
        {
          role: "system",
          content:
            "Tu vérifies si un texte envoyé par un client de service TikTok Booster est un lien TikTok ou un nom d'utilisateur TikTok valide (format uniquement, pas besoin de naviguer sur internet). " +
            "Réponds UNIQUEMENT en JSON strict, sans texte autour, au format : " +
            '{"valide": true ou false, "raison": "courte explication en français"}'
        },
        { role: "user", content: input }
      ],
      temperature: 0
    })
  });

  if (!res.ok) throw new Error(`Grok API failed: ${res.status}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "{}";

  try {
    const clean = content.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return { valide: true, raison: "Vérification automatique indisponible, accepté par défaut" };
  }
}

module.exports = { verifyTikTokLink };
