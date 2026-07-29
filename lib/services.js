// ============================================================
// CONFIGURATION DES SERVICES — TikTok BOOSTER
// ============================================================

const SERVICES = {
  abonnes: {
    label: "Abonnés TikTok",
    smmfollows_service_id: 18860,
    tiers: [
      { quantity: 500, price_fcfa: 1225, chariow_product_id: "prd_joc6fttz" },
      { quantity: 1000, price_fcfa: 2450, chariow_product_id: "prd_fkd4s3w0" },
      { quantity: 5000, price_fcfa: 12230, chariow_product_id: "prd_paz5fxau" }
    ]
  },
  likes: {
    label: "Likes TikTok",
    smmfollows_service_id: 16462,
    tiers: [
      { quantity: 1000, price_fcfa: 577, chariow_product_id: "prd_mejkd1qd" },
      { quantity: 5000, price_fcfa: 2375, chariow_product_id: "prd_lpud3u5g" }
    ]
  }
};

function estimatePrice(serviceKey, quantity) {
  const service = SERVICES[serviceKey];
  if (!service) return null;
  const smallest = [...service.tiers].sort((a, b) => a.quantity - b.quantity)[0];
  const ratio = smallest.price_fcfa / smallest.quantity;
  return Math.round(ratio * quantity);
}

function closestTier(serviceKey, quantity) {
  const service = SERVICES[serviceKey];
  if (!service) return null;
  const sorted = [...service.tiers].sort((a, b) => a.quantity - b.quantity);
  const match = sorted.find(t => t.quantity >= quantity);
  return match || sorted[sorted.length - 1];
}

module.exports = { SERVICES, estimatePrice, closestTier };
