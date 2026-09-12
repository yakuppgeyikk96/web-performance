// In-memory catalog. Deterministic (seeded) so every measurement sees the same data.
// Replaced by PostgreSQL in phase 3.

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number; // minor units (kuruş)
  rating: number; // 1.0 – 5.0
  description: string;
};

const CATEGORIES = ["Kitchen", "Audio", "Outdoor", "Desk", "Lighting", "Bags"];
const ADJECTIVES = ["Nordic", "Copper", "Matte", "Walnut", "Slate", "Linen", "Cobalt", "Amber", "Ivory", "Graphite"];
const NOUNS = ["Kettle", "Speaker", "Lantern", "Notebook", "Lamp", "Backpack", "Grinder", "Headphones", "Tent", "Tray"];

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(random: () => number, items: readonly T[]): T {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) throw new Error("empty list");
  return item;
}

function buildCatalog(count: number): Product[] {
  const random = mulberry32(2026);
  const products: Product[] = [];
  for (let id = 1; id <= count; id += 1) {
    const adjective = pick(random, ADJECTIVES);
    const noun = pick(random, NOUNS);
    const name = `${adjective} ${noun} ${id}`;
    products.push({
      id,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      category: pick(random, CATEGORIES),
      price: 1990 + Math.floor(random() * 48000),
      rating: Math.round((3 + random() * 2) * 10) / 10,
      description:
        `The ${name} is a ${adjective.toLowerCase()} take on the everyday ${noun.toLowerCase()}. ` +
        "Built to last, priced to move, and photographed at a resolution nobody asked for.",
    });
  }
  return products;
}

export const products: readonly Product[] = buildCatalog(240);

export function findProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function formatPrice(minorUnits: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(minorUnits / 100);
}
