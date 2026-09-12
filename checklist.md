# Uçtan Uca Performans Denetim Listesi

Kişisel runbook. Her lab bir-üç madde ekler; madde formatı: **ne kontrol edilir → nasıl ölçülür → hangi lab'da kanıtlandı.**
Faz 7'de runbook'a derlenir.

## 0 · Ölçüm ve yöntem

- Ölçüm ortamı eklentisiz mi? → Gizli pencere veya ayrı profil; Summary'de 1st party dışında satır olmamalı. (L00)
- Throttling açık mı ve notta yazılı mı? → Kalibre CPU (bu makinede 4.4×) + Slow 4G; `docs/baseline.md`. (L00)
- LCP/CLS ve INP ayrı kayıtlarda mı ölçüldü? → Yükleme bitmeden dokunma; LCP ilk girdide donar. (L00)
- Aracın adlandırdığı LCP elemanı gerçekten hedeflenen eleman mı? → Insights "LCP request discovery" kartında adı kontrol et; öneriyi ona göre değerlendir. (L00)

## 1 · Ağ ve yükleme

## 2 · Ana iş parçacığı ve render

## 3 · Sunucu ve veri

## 4 · React / Next

## 5 · Gözlemlenebilirlik ve kapılar

## 6 · Algılanan performans ve UX
