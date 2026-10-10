# 🍅 Pomodoro

iOS ve Android için tek kod tabanlı (Expo / React Native), sade bir Pomodoro odak zamanlayıcısı.

## Özellikler
- Odak (25 dk), kısa mola (5 dk), uzun mola (15 dk) modları
- Dairesel ilerleme halkası, başlat / duraklat / sıfırla / atla
- Her 4 odak seansında bir otomatik uzun mola (ayarlanabilir)
- Uygulama arka plandayken süre bitince bildirim
- Zamanlayıcı çalışırken ekran kapanmaz, dokunsal geri bildirim
- Günlük tamamlanan seans sayacı, kalıcı ayarlar
- Türkçe / İngilizce (cihaz diline göre)

## Çalıştırma
```bash
npm install
npx expo start      # telefonda Expo Go ile QR kodu okutun
```

## Mağazalara yayınlama (EAS)
```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform all
npx eas-cli@latest submit --platform all
```
Gerekenler: Apple Developer hesabı (yıllık 99 $) ve Google Play Console hesabı (tek seferlik 25 $).
