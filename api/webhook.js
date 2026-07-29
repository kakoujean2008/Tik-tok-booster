const { updateOrder, getOrders } = require("../lib/jsonbin");
const { placeOrder } = require("../lib/smmfollows");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Méthode non autorisée");
  }

  res.status(200).send("OK");

  try {
    const payload = req.body;
    const event = payload.event;

    if (event === "successful.sale") {
      const sale = payload.sale;
      const metadata = sale.custom_metadata || {};
      const id_commande = metadata.id_commande;

      if (!id_commande) {
        console.error("Pulse sans id_commande dans les métadonnées");
        return;
      }

      const commandes = await getOrders();
      const existing = commandes.find(c => c.id_commande === id_commande);
      if (!existing || existing.statut === "livre" || existing.statut === "paye") {
        return;
      }

      await updateOrder(id_commande, {
        statut: "paye",
        id_vente_chariow: sale.id
      });

      const smmResult = await placeOrder({
        service_id: existing.smmfollows_service_id,
        link: existing.tiktok_input,
        quantity: existing.quantity
      });

      await updateOrder(id_commande, {
        statut: "livre",
        smmfollows_order_id: smmResult.order,
        date_livraison: new Date().toISOString()
      });

      console.log(`Commande ${id_commande} livrée automatiquement, ordre Smmfollows #${smmResult.order}`);
    }

    if (event === "failed.sale" || event === "abandoned.sale") {
      const metadata = payload.sale?.custom_metadata || {};
      if (metadata.id_commande) {
        await updateOrder(metadata.id_commande, { statut: "echoue" });
      }
    }
  } catch (err) {
    console.error("Erreur traitement webhook:", err);
  }
};
