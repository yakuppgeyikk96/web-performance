# Uçtan Uca Performans Denetim Listesi

Kişisel runbook. Her lab bir-üç madde ekler; madde formatı: **ne kontrol edilir → nasıl ölçülür → hangi lab'da kanıtlandı.**
Faz 7'de runbook'a derlenir.

## 0 · Ölçüm ve yöntem

- Ölçüm ortamı eklentisiz mi? → Gizli pencere veya ayrı profil; Summary'de 1st party dışında satır olmamalı. (L00)
- Throttling açık mı ve notta yazılı mı? → Kalibre CPU (bu makinede 4.4×) + Slow 4G; `docs/baseline.md`. (L00)
- LCP/CLS ve INP ayrı kayıtlarda mı ölçüldü? → Yükleme bitmeden dokunma; LCP ilk girdide donar. (L00)
- Aracın adlandırdığı LCP elemanı gerçekten hedeflenen eleman mı? → Insights "LCP request discovery" kartında adı kontrol et; öneriyi ona göre değerlendir. (L00)

## 1 · Ağ ve yükleme

- LCP elemanı `loading="lazy"` taşıyor mu? → Insights "LCP request discovery"; ilk ekrandaki görsellerde asla lazy. (L01)
- LCP görseli HTML'de `<img>` olarak keşfedilebilir mi, yoksa CSS/JS'ten mi geliyor? → Network track'te isteğin başlangıcı TTFB'ye yakın olmalı; CSS arka planı ~1 s geciktirdi. (L01)
- LCP'nin dört fazından hangisi en büyük? → Sadece o faza yönelik düzeltme ölç; `fetchpriority` delay'i hedefler, duration'a dokunmaz. (L01)
- Görselin boyutu ilk boyamadan önce biliniyor mu? → Erken istek + `width`/`height`; geç öğrenilen boyut CLS'e döner. (L01)

## 2 · Ana iş parçacığı ve render

## 3 · Sunucu ve veri

## 4 · React / Next

## 5 · Gözlemlenebilirlik ve kapılar

## 6 · Algılanan performans ve UX
