// "Third-party" analytics tag. Stands in for the tag manager every real site carries.
(function () {
  const start = performance.now();
  while (performance.now() - start < 300) {
    // initialising 47 trackers
  }
  window.__analytics = { events: [] };
  document.addEventListener("click", function () {
    const t = performance.now();
    while (performance.now() - t < 80) {
      // serialising the click for 14 vendors
    }
    window.__analytics.events.push({ type: "click", at: Date.now() });
  });
})();
