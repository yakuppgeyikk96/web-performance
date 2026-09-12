// Slow Shop client script. Loaded synchronously from <head>.

function busy(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end) {
    // burn the main thread
  }
}

let cartCount = 0;

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  busy(250); // "validating stock"
  cartCount += 1;
  document.getElementById("cart-count").textContent = String(cartCount);
  button.classList.add("added");
  button.textContent = "Added";
});

document.addEventListener("input", (event) => {
  if (event.target.id !== "search") return;
  const query = event.target.value.trim().toLowerCase();
  const cards = document.querySelectorAll("#grid .card");
  let visible = 0;
  for (const card of cards) {
    busy(0.6); // "fuzzy matching"
    const matches = card.dataset.name.toLowerCase().includes(query);
    card.classList.toggle("hidden", !matches);
    if (matches) visible += 1;
  }
  document.getElementById("result-count").textContent = `${visible} products`;
});

setTimeout(() => {
  const main = document.getElementById("main");
  if (!main) return;
  const promo = document.createElement("div");
  promo.className = "promo";
  promo.textContent = "Free shipping this week on orders over ₺500";
  main.prepend(promo);
}, 1500);
