// Fetches live inventory from Shopify Admin API
// Requires SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_TOKEN in .env.local

const QUERY = `
  query GetInventory($cursor: String) {
    products(first: 50, after: $cursor) {
      nodes {
        variants(first: 5) {
          nodes {
            sku
            inventoryQuantity
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

export interface InventoryMap {
  [sku: string]: number; // boxes in stock
}

export async function fetchShopifyInventory(): Promise<InventoryMap> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_TOKEN;

  if (!domain || !token) return {};

  const inventory: InventoryMap = {};
  let cursor: string | null = null;

  do {
    const res: Response = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query: QUERY, variables: { cursor } }),
      next: { revalidate: 300 }, // cache 5 minutes
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json: any = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page: any = json?.data?.products;
    if (!page) break;

    for (const product of page.nodes) {
      for (const variant of product.variants.nodes) {
        // Skip sample SKUs (end in -S) and nulls
        if (!variant.sku || variant.sku.endsWith("-S")) continue;
        inventory[variant.sku] = Math.max(0, variant.inventoryQuantity ?? 0);
      }
    }

    cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (cursor);

  return inventory;
}

export function getStockLevel(boxes: number): "In Stock" | "Low Stock" | "Out of Stock" {
  if (boxes <= 0) return "Out of Stock";
  if (boxes <= 10) return "Low Stock";
  return "In Stock";
}
