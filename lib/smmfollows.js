// ============================================================
// SMMFOLLOWS — passage de commande automatique
// ============================================================

const API_URL = "https://smmfollows.com/api/v2";

async function placeOrder({ service_id, link, quantity }) {
  const params = new URLSearchParams({
    key: process.env.SMMFOLLOWS_API_KEY,
    action: "add",
    service: service_id,
    link,
    quantity
  });

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });

  if (!res.ok) throw new Error(`Smmfollows order failed: ${res.status}`);
  const data = await res.json();

  if (data.error) throw new Error(`Smmfollows error: ${data.error}`);
  return data;
}

async function getOrderStatus(order_id) {
  const params = new URLSearchParams({
    key: process.env.SMMFOLLOWS_API_KEY,
    action: "status",
    order: order_id
  });

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });

  if (!res.ok) throw new Error(`Smmfollows status check failed: ${res.status}`);
  return res.json();
}

module.exports = { placeOrder, getOrderStatus };
