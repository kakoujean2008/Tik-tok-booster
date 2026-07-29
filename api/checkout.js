const { SERVICES } = require("../lib/services");
const { addOrder } = require("../lib/jsonbin");

const CHARIOW_API = "https://api.chariow.com/v1/checkout";

function generateOrderId() {
  return "cmd_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { service_key, chariow_product_id, quantity, tiktok_input, email } = req.body;

  const service = SERVICES[service_key];
  if (!service) {
    return res.status(400).json({ error: "Service inconnu" });
  }

  const tier = service.tiers.find(t => t.chariow_product_id === chariow_product_id);
  if (!tier) {
    return res.status(400).json({ error: "Palier de prix invalide" });
  }

  if (!tiktok_input || !email) {
    return res.status(400).json({ error: "Lien TikTok et email requis" });
  }

  const id_commande = generateOrderId();

  const forwardedFor = req.headers["x-forwarded-for"];
  const customer_ip = forwardedFor ? forwardedFor.split(",")[0].trim() : undefined;

  try {
    const chariowRes = await fetch(CHARIOW_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CHARIOW_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        product_id: chariow_product_id,
        email,
        first_name: "Client",
        last_name: "TikTokBooster",
        phone: { number: "0000000000", country_code: "CI" },
        redirect_url: `${process.env.SITE_URL}/merci.html?commande=${id_commande}`,
        custom_metadata: {
          id_commande,
          service: service_key,
          quantity: String(quantity),
          tiktok_input
        },
        ...(customer_ip ? { customer_ip } : {})
      })
    });

    const chariowData = await chariowRes.json();

    if (!chariowRes.ok) {
      console.error("Erreur Chariow:", chariowData);
      return res.status(502).json({ error: "Le paiement n'a pas pu être initié" });
    }

    await addOrder({
      id_commande,
      id_vente_chariow: chariowData.data?.purchase?.id || null,
      service: service_key,
      smmfollows_service_id: service.smmfollows_service_id,
      quantity: tier.quantity,
      price_fcfa: tier.price_fcfa,
      tiktok_input,
      email,
      statut: "en_attente",
      date_creation: new Date().toISOString(),
      date_livraison: null,
      smmfollows_order_id: null
    });

    return res.status(200).json({
      checkout_url: chariowData.data?.payment?.checkout_url,
      id_commande
    });
  } catch (err) {
    console.error("Erreur checkout:", err);
    return res.status(500).json({ error: "Erreur serveur, réessaie dans un instant" });
  }
};
