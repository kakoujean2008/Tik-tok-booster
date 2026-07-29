// ============================================================
// JSONBIN — stockage des commandes
// ============================================================

const BASE_URL = "https://api.jsonbin.io/v3/b";

async function getOrders() {
  const res = await fetch(`${BASE_URL}/${process.env.JSONBIN_BIN_ID}/latest`, {
    headers: { "X-Master-Key": process.env.JSONBIN_MASTER_KEY }
  });
  if (!res.ok) throw new Error(`JSONBin GET failed: ${res.status}`);
  const json = await res.json();
  return json.record.commandes || [];
}

async function saveOrders(commandes) {
  const res = await fetch(`${BASE_URL}/${process.env.JSONBIN_BIN_ID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": process.env.JSONBIN_MASTER_KEY
    },
    body: JSON.stringify({ commandes })
  });
  if (!res.ok) throw new Error(`JSONBin PUT failed: ${res.status}`);
  return res.json();
}

async function addOrder(order) {
  const commandes = await getOrders();
  commandes.push(order);
  await saveOrders(commandes);
  return order;
}

async function updateOrder(id_commande, updates) {
  const commandes = await getOrders();
  const idx = commandes.findIndex(c => c.id_commande === id_commande);
  if (idx === -1) throw new Error(`Commande ${id_commande} introuvable`);
  commandes[idx] = { ...commandes[idx], ...updates };
  await saveOrders(commandes);
  return commandes[idx];
}

async function findOrderBySaleId(sale_id) {
  const commandes = await getOrders();
  return commandes.find(c => c.id_vente_chariow === sale_id);
}

module.exports = { getOrders, saveOrders, addOrder, updateOrder, findOrderBySaleId };
