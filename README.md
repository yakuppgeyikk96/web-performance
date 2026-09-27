# Web Performance & UX — Uçtan Uca Uzmanlık Hattı

Amaç: gerçek bir ürünün tarayıcıdan veritabanına kadar performansını ölçebilmek, sorunu saptayıp
düzeltebilmek ve konu hakkında konuşup yazabilecek seviyeye gelmek. Teori değil pratik; her lab
**kır → ölç → düzelt → ölç → yaz → anlat** döngüsüyle ilerler.

Kaynak haritalar: [Frontend Ustalık Haritası](https://claude.ai/code/artifact/7b6a0056-d33e-4e51-94f0-b93d999c8b9e) ·
[Backend Derinlik Haritası](https://claude.ai/code/artifact/1c6fdfb9-e1c5-4dd2-9503-a96723ecc397).
İkisi de aynı sırayı dayatıyor: önce ölçme aracı ve platform modeli, sonra gözlemlenebilirlik, en son optimizasyon.

## Demo ürün: `shop`

Bilerek yavaş kurulmuş küçük bir vitrin. LCP için hero görsel, CLS için font/banner, INP için arama-filtre ve sepet,
TTFB için listeleme/detay sorguları, cache için katalog, yük testi için "indirim günü".

| Yüzey | Faz | Teknoloji |
| --- | --- | --- |
| `shop/api` | 0–3 | Fastify + Drizzle + PostgreSQL 17 + Redis 8, sunucuda HTML üreten MPA, Node 24, TS strict |
| `shop/next` | 4+ | Next.js 16 App Router, React 19 + Compiler, TanStack Query/Virtual |
| `shop/edge` | 3+ | Caddy reverse proxy: CDN/edge cache simülasyonu |
| `perf/` | 5+ | k6, Lighthouse CI, size-limit, web-vitals toplayıcı |
| Gözlem | 5 | OpenTelemetry, Prometheus, Grafana, Tempo |

## Klasörler

- `labs/` — `NN-slug.md` lab notları: ne kırdık, önce/sonra ölçüm, ne öğrendik. Kanıt.
- `docs/` — düz teori ve karar notları. Kısa, İngilizce.
- `blog/` — yazı taslakları (Türkçe).
- `checklist.md` — kişisel uçtan uca performans denetim listesi; her lab madde ekler.

## Lab ritüeli

1. **Hipotez** — hangi metrik, beklenen sebep, beklenen kazanç.
2. **Kır** — sorunu bilerek üret.
3. **Ölç (önce)** — cihaz tabanıyla (`docs/baseline.md`), 3–5 tekrar, medyan + yayılım. Lab ve saha ayrımı her notta.
4. **Düzelt** — tek değişken.
5. **Ölç (sonra)**.
6. **Çıktılar** — lab notu · checklist maddesi · blog taslağı · 5 dakikalık sözlü anlatım.

Haftalık ritim (5–8 saat): kur+kır+ölç (~3 s) · düzelt+ölç (~2 s) · yaz+anlat (~1–2 s). Bir lab ≈ bir hafta; "(2h)" iki hafta.

## Fazlar ve lab'lar

FE = Frontend haritası konu id'si · BE = Backend haritası küme no.

### Faz 0 — Ölçüm dili ve araç okuryazarlığı

- **L00 Kurulum ve cihaz tabanı** — repo, docker compose, Node 24, mkcert; "bilerek yavaş" shop fixture'ı; DevTools Performance panelinde canlı CWV, throttling profili, ilk trace. `docs/baseline.md`, `docs/2026-state.md`. FE cwv M6.
- **L01 LCP anatomisi** — TTFB + kaynak yükleme gecikmesi + yükleme süresi + render gecikmesi; WebPageTest; `fetchpriority`, lazy'yi kaldır, `preload`. FE cwv M1/M4, load-perf M3.
- **L02 CLS ve INP anatomisi** — boyutsuz medya, font swap; 300 ms task; LoAF; web-vitals v6 attribution; Lighthouse 13 akışları. FE cwv M2/M3/M5, event-loop M4.

### Faz 1 — Ağ ve yükleme

- **L03 Bağlantı ve HTTP sürümleri** — DNS/TCP/TLS waterfall; HTTP/1.1 vs HTTP/2, 100 küçük kaynak; `curl -w`. FE network M1–2, BE 00.4.
- **L04 Critical rendering path** — render-blocking CSS/JS, `async`/`defer`/`module`, kritik CSS inline, `preconnect`/`preload`. FE render-pipeline M6.
- **L05 HTTP cache semantiği + bfcache** — `Cache-Control`, `ETag`/304, content hash, SWR; `notRestoredReasons`. FE network M3, BE 03.1.
- **L06 Görseller ve fontlar** — AVIF/WebP, `srcset`/`sizes`, LQIP; subsetting, `font-display`, `size-adjust`. Hedef CLS 0. FE load-perf M3–4/M6.
- **L07 Sıkıştırma, üçüncü parti, Early Hints** — gzip/brotli/zstd CPU takası; facade; 103. FE load-perf M5, BE 09.3.
- **L08 Speculation Rules** — prefetch/prerender, eagerness; gezinme LCP'si. FE network M4.

### Faz 2 — Ana iş parçacığı ve render pipeline

- **L09 Event loop deneyleri** — task/microtask/rAF/idle; starvation; render fırsatı. FE event-loop M1–3, BE 01.2.
- **L10 Long task → INP (2h)** — 10k ürünlü filtre; LoAF; `scheduler.yield`, `postTask`; "kodu silmek yielding'den iyidir". FE event-loop M4, concurrent giriş.
- **L11 Layout thrashing ve compositing** — forced sync layout; `transform` vs `top`; `will-change`; `content-visibility`. FE render-pipeline M2–5.
- **L12 Web Worker** — filtreyi worker'a; structured clone, transferable. FE event-loop M5.
- **L13 Bellek** — detached DOM, listener, sınırsız cache; heap snapshot; LRU. FE js-core M7, data-structures M5.

### Faz 3 — Sunucu ve veri katmanı

- **L14 Node event loop yük altında** — autocannon; `pbkdf2Sync`, büyük JSON; `monitorEventLoopDelay`; flame graph; `worker_threads`. BE 01.8, 09.3.
- **L15 İndeks laboratuvarı (2h)** — 5M satır; `EXPLAIN (ANALYZE, BUFFERS)`; bileşik/covering index; keyset vs offset; `pg_stat_statements`; bloat. BE 02.3, 02.5.
- **L16 N+1 ve bağlantı havuzu** — sorgu logunda N+1; batch; havuz 5/20/100; timeout'lar. BE 02.9, 09.4.
- **L17 Önbellek katmanları ve stampede (2h)** — cache-aside, jitter, single-flight, stale-on-error, L1+L2, etiketle geçersizleştirme. BE 02.7, 09.2.
- **L18 Edge ve TTFB** — Caddy ile SWR, cache tag, purge; `Server-Timing`; erken `<head>` akışı. BE 09.5, 03.1.
- **L19 Yük testi ve dayanıklılık** — k6, coordinated omission, p99; Little yasası; timeout/circuit breaker/load shedding. BE 07.3, 06.4, 09.1.

### Faz 4 — React ve Next.js katmanı

- **L20 Render stratejileri (2h)** — SSG/ISR/SSR/streaming vs MPA; hydration maliyeti ve mismatch. FE render-strategies.
- **L21 RSC, streaming, Suspense** — sunucu waterfall; Suspense sınırı; Cache Components / `use cache` / `revalidateTag`. FE rsc, metaframework M2.
- **L22 React runtime performansı** — Profiler; state'i aşağı itme; Compiler açık/kapalı; `useTransition`/`useDeferredValue`; TanStack Virtual. FE reconciliation, react-perf, concurrent, react19.
- **L23 İstemci veri ve bundle** — `staleTime`/`gcTime`, prefetch, optimistic; kod bölme; barrel; `size-limit`; chunk 404. FE query, routing, build, code-org M3.
- **L24 Soft navigation ve View Transitions** — web-vitals `reportSoftNavs`; geçişler; kaydırma restorasyonu. FE css-2026 M4, routing M6.

### Faz 5 — Uçtan uca gözlemlenebilirlik ve kapılar

- **L25 RUM** — attribution → `sendBeacon` → kendi toplayıcı → p75 panosu; regresyon alarmı; CrUX API. FE observability M2, cwv M5.
- **L26 Trace FE→BE (2h)** — OTel + `traceparent` → Fastify → PG → Tempo; event loop lag metrikleri; RED/USE; enjekte gecikmeyi 10 dk'da bul. FE observability M4, BE 08.2–08.3.
- **L27 CI kapıları** — Lighthouse CI, `size-limit`, k6 threshold, axe; `docs/perf-budget.md`. FE cicd M1–2, load-perf M1.

### Faz 6 — Algılanan performans ve UX

- **L28 Algılanan performans** — iskelet penceresi (~400 ms–3 s), `useOptimistic`, Nielsen eşikleri; Element Timing; durum tasarımı. FE product M2–3.
- **L29 Hareket ve erişilebilirlik** — `transform`/`opacity`, scroll-driven, `prefers-reduced-motion` ve INP, klavye turu. FE product M4, a11y M3/M6.

### Faz 7 — Bitirme

- **L30 Gerçek site denetimi (2h)** — CrUX API + WebPageTest deneyleri; öncelikli backlog; yazılı rapor.
- **L31 Anlatı** — 45 dk sunum; checklist → runbook; blog yazıları; mülakat provası.

Toplam 32 lab. Haftada bir lab ile ~7 ay; 6 aya sığdırmak için L12, L24, L29 ve L07'nin Early Hints kısmı atlanabilir.

## Bilerek dışarıda bırakılanlar

Kuyruklar, güvenlik, mimari, Kubernetes, GraphQL, gRPC, micro-frontend, WASM derinliği, Service Worker/PWA, i18n.
İhtiyaç doğarsa ek lab olur.

## Çalışma biçimi

Kısa sohbet adımları; tasarım kararlarında önce sen önerirsin. Kritik kodu sen yazarsın; fixture, seed ve compose gibi
öğrenme konusu olmayan parçaları ben verebilirim. Notlar İngilizce ve kısa, blog Türkçe. Haritaların "kendini test"
soruları kapı değil, lab sonu sohbeti.

## İlerleme

| Lab | Durum | Not |
| --- | --- | --- |
| L00 · Kurulum ve cihaz tabanı | ✅ | `labs/00-first-trace.md`: LCP 1.70 s (yanıltıcı), INP 647 ms, CLS 0.41 |
| L01 · LCP anatomisi | ✅ | `labs/01-lcp-anatomy.md`: lazy kaldırınca load delay 1 206 → 153 ms, CLS 0.53 → 0.09; kalan 13.5 s indirme (L06) |
| L02 · CLS ve INP anatomisi | ✅ | `labs/02-cls-inp.md`: CLS 0.04 → 0.00 (promo sunucuda, görsel boyutları); INP 560 ms teşhis: 96 + 422 + 41, iki dinleyici, üst üste binen tuşlar |
| Faz 0 blog taslağı | ⏳ | L00–L02 birleşik yazı |
| L03 · Bağlantı ve HTTP sürümleri | ⏳ | |
