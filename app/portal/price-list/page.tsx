import { getSession } from "@/lib/session";
import { getRepSettings } from "@/lib/rep-settings";
import productsData from "@/data/products.json";
import PriceListClient from "./PriceListClient";

type Product = (typeof productsData)[number];

const tierKey: Record<string, keyof Product> = {
  A: "tier_a_price_sqft",
  B: "tier_b_price_sqft",
  C: "tier_c_price_sqft",
};

const categories = ["Marble Mosaics", "Travertine", "Ceramics"];

export default async function PriceListPage() {
  const session = await getSession();
  const tier = session?.tier ?? "C";
  const repPriceKey = tierKey[tier] ?? "tier_c_price_sqft";

  const repSettings = await getRepSettings(session?.repEmail ?? "");

  const products = productsData
    .filter((p) => categories.includes(p.category) && !repSettings.disabled_product_ids.includes(p.id))
    .map((p) => ({
      id: p.id,
      name: p.name,
      subtitle: (p as { subtitle?: string }).subtitle ?? "",
      category: p.category,
      material: p.material,
      size: p.size,
      finish: p.finish,
      sku: p.sku,
      sqft_per_box: p.sqft_per_box,
      retail_price_sqft: p.retail_price_sqft,
      rep_price_sqft: p[repPriceKey] as number,
      recommended_overage: (p as { recommended_overage?: number }).recommended_overage ?? 10,
      stock_level: p.stock_level,
      sqft_available: p.sqft_available,
      website_url: (p as { website_url?: string }).website_url ?? "",
      detail: (p as { detail?: unknown }).detail,
    }));

  const grouped = categories.map((cat) => ({
    category: cat,
    products: products.filter((p) => p.category === cat),
  }));

  return <PriceListClient grouped={grouped} tier={tier} />;
}
