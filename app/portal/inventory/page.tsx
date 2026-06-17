import InventoryClient from "./InventoryClient";
import productsData from "@/data/products.json";

export default function InventoryPage() {
  const inventory = productsData.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    stock_level: p.stock_level,
    sqft_available: p.sqft_available,
  }));

  return <InventoryClient initialInventory={inventory} />;
}
