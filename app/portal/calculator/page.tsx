import { getSession } from "@/lib/session";
import { getRepSettings } from "@/lib/rep-settings";
import { Suspense } from "react";
import CalculatorClient from "./CalculatorClient";
import productsData from "@/data/products.json";

type Product = typeof productsData[number];

const tierKey: Record<string, keyof Product> = {
  A: "tier_a_price_sqft",
  B: "tier_b_price_sqft",
  C: "tier_c_price_sqft",
};

export default async function CalculatorPage() {
  const session = await getSession();
  const tier = session?.tier ?? "C";
  const repPriceKey = tierKey[tier] ?? "tier_c_price_sqft";

  const repSettings = await getRepSettings(session?.repEmail ?? "");

  const products = productsData
    .filter((p) => !repSettings.disabled_product_ids.includes(p.id))
    .map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    retail_price_sqft: p.retail_price_sqft,
    rep_price_sqft: p[repPriceKey] as number,
    sqft_per_box: p.sqft_per_box,
    recommended_overage: (p as { recommended_overage?: number }).recommended_overage ?? 10,
  }));

  return (
    <Suspense>
      <CalculatorClient products={products} tier={tier} maxDiscounts={repSettings.max_discounts} />
    </Suspense>
  );
}
