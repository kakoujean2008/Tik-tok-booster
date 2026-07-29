const { verifyTikTokLink } = require("../lib/grok");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { input } = req.body;

  if (!input || input.trim().length < 2) {
    return res.status(400).json({ valide: false, raison: "Champ vide" });
  }

  try {
    const result = await verifyTikTokLink(input.trim());
    return res.status(200).json(result);
  } catch (err) {
    console.error("Erreur verify-link:", err);
    return res.status(200).json({ valide: true, raison: "Vérification indisponible" });
  }
};
