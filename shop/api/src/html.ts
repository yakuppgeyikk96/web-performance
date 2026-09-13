// Page templates for the deliberately slow shop. Every choice here is a lab subject.
import { formatPrice, type Product } from "./catalog.ts";

function escape(text: string): string {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

export function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(title)} · Slow Shop</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600">
  <link rel="stylesheet" href="/styles.css">
  <script src="/vendor/analytics.js"></script>
  <script src="/app.js"></script>
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/">Slow Shop</a>
    <nav>
      <a href="/">Catalog</a>
      <a href="/cart" class="cart-link">Cart <span id="cart-count">0</span></a>
    </nav>
  </header>
  <main id="main">
${body}
  </main>
  <footer class="site-footer">Slow Shop · a fixture for web-performance labs</footer>
</body>
</html>`;
}

function card(product: Product): string {
  return `      <article class="card" data-name="${escape(product.name)}" data-category="${escape(product.category)}">
        <a href="/products/${product.slug}">
          <img src="/img/product/${product.id}.svg" alt="">
          <h3>${escape(product.name)}</h3>
        </a>
        <p class="meta">${escape(product.category)} · ★ ${product.rating}</p>
        <p class="price">${formatPrice(product.price)}</p>
        <button type="button" data-add="${product.id}">Add to cart</button>
      </article>`;
}

export function catalogPage(products: readonly Product[]): string {
  const body = `    <section class="hero">
      <img src="/img/hero.png" alt="Autumn collection" fetchpriority="high">
      <div class="hero-copy">
        <h1>Autumn collection</h1>
        <p>Everything you need, delivered as slowly as we render it.</p>
      </div>
    </section>
    <section class="toolbar">
      <label for="search">Search</label>
      <input id="search" type="search" placeholder="Try &quot;lamp&quot;" autocomplete="off">
      <span id="result-count">${products.length} products</span>
    </section>
    <section class="grid" id="grid">
${products.map(card).join("\n")}
    </section>`;
  return layout("Catalog", body);
}

export function productPage(product: Product): string {
  const body = `    <article class="product">
      <img src="/img/product/${product.id}.svg" alt="${escape(product.name)}">
      <div class="product-copy">
        <p class="meta">${escape(product.category)} · ★ ${product.rating}</p>
        <h1>${escape(product.name)}</h1>
        <p class="price">${formatPrice(product.price)}</p>
        <p>${escape(product.description)}</p>
        <button type="button" data-add="${product.id}">Add to cart</button>
        <p><a href="/">← Back to catalog</a></p>
      </div>
    </article>`;
  return layout(product.name, body);
}

export function notFoundPage(): string {
  return layout(
    "Not found",
    `    <h1>Not found</h1>\n    <p><a href="/">Back to catalog</a></p>`,
  );
}

export function productImage(product: Product): string {
  const hue = (product.id * 47) % 360;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 60% 75%)"/>
      <stop offset="1" stop-color="hsl(${(hue + 40) % 360} 55% 45%)"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1200" fill="url(#g)"/>
  <circle cx="600" cy="560" r="300" fill="hsl(${(hue + 180) % 360} 50% 40% / 0.35)"/>
  <text x="600" y="1080" text-anchor="middle" font-family="sans-serif" font-size="64" fill="white">${escape(product.name)}</text>
</svg>`;
}
