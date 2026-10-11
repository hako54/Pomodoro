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
npx expo start --go   # telefonda Expo Go ile QR kodu okutun
```
Geliştirme sürümü (`development` profili) telefona kuruluysa `--go` olmadan `npx expo start` kullanın.

## Mağazalara yayınlama (EAS)
Derleme ve gönderim Expo'nun bulut servisi EAS ile yapılır; Mac, Xcode veya Android Studio gerekmez. Ayarlar `eas.json` içindedir.

| Profil | Ne için | Çıktı |
|---|---|---|
| `development` | Geliştirme sürümü (bildirimler, açılış ekranı gibi Expo Go'da olmayan şeyleri denemek) | Dahili dağıtım |
| `preview` | Arkadaşlara/test edenlere dağıtmak | Android: doğrudan kurulabilen `.apk`, iOS: dahili dağıtım |
| `production` | Mağazalar | Android: `.aab`, iOS: `.ipa`; derleme numarası otomatik artar |

### Bir kerelik hazırlık
1. **Hesaplar:** [expo.dev](https://expo.dev) (ücretsiz), Apple Developer Program (yıllık 99 $), Google Play Console (tek seferlik 25 $).
2. **Projeyi EAS'a bağla** (`app.json` içine `owner` ve `extra.eas.projectId` ekler; değişikliği commit edin):
   ```bash
   npx eas-cli@latest login
   npx eas-cli@latest init
   ```
3. **Paket kimliği:** `app.json` içinde `com.hako54.pomodoro` kullanılıyor. Mağazaya ilk yüklemeden sonra değiştirilemez; farklı bir kimlik istiyorsanız şimdi değiştirin.

### Test sürümü
```bash
npx eas-cli@latest build --profile preview --platform android   # telefona kurulabilen APK bağlantısı verir
npx eas-cli@latest build --profile preview --platform ios        # iPhone'unuzu önce kaydettirmenizi ister
```

### Mağaza sürümü
```bash
npx eas-cli@latest build --profile production --platform all
```
İlk iOS derlemesinde EAS, Apple hesabınızla giriş yapıp imzalama sertifikalarını sizin için oluşturur.

### Gönderim
- **iOS:** `npx eas-cli@latest submit --platform ios --latest` — uygulamayı App Store Connect'te oluşturur ve TestFlight'a yükler. İnceleme için gönderme, metinler ve ekran görüntüleri App Store Connect'ten yapılır (`store/` klasörü).
- **Android:** Google, bir uygulamanın **ilk** `.aab` dosyasının Play Console'a elle yüklenmesini ister. Sonraki sürümler için:
  1. Play Console'da bir servis hesabı anahtarı (JSON) oluşturun ve proje köküne `google-service-account.json` adıyla koyun (git'e eklenmez).
  2. `npx eas-cli@latest submit --platform android --latest` — sürümü **dahili test** kanalına **taslak** olarak yükler; yayına alma kararı Play Console'da sizde kalır.

## İkon ve açılış ekranı
Tüm ikon/açılış görselleri `design/generate.py` ile SVG'den üretilir (renkleri ve şekli oradan değiştirebilirsiniz):
```bash
python3 design/generate.py   # Pillow ve Chromium gerekir
```
![Önizleme](design/preview.png)

## Mağaza ekran görüntüleri
Hazır görseller `store/screenshots/` altında (İngilizce `en`, Türkçe `tr`):

| Klasör | Boyut | Nereye |
|---|---|---|
| `ios-6.9/` | 1320×2868 | App Store – iPhone 6,9" |
| `ipad-13/` | 2064×2752 | App Store – iPad 13" |
| `android-phone/` | 1080×1920 | Google Play – telefon |
| `google-play-feature/` | 1024×500 | Google Play – öne çıkan görsel |

Yeniden üretmek için (uygulamadaki gerçek ekranlar yakalanır):
```bash
npx expo export --platform web --output-dir /tmp/web
npx http-server /tmp/web -p 8765 -s &
node store/capture.mjs /tmp/raw     # ekranları yakalar
node store/compose.mjs /tmp/raw     # başlık + cihaz çerçevesiyle birleştirir
```
Başlık metinleri `store/compose.mjs` içindeki `COPY` bölümünden değiştirilebilir.

## Mağaza metinleri ve gizlilik
- Mağaza açıklamaları (ad, alt başlık, açıklama, anahtar kelimeler): [`store/listing/en.md`](store/listing/en.md), [`store/listing/tr.md`](store/listing/tr.md)
- Gizlilik politikası: [`PRIVACY.md`](PRIVACY.md) — her iki mağaza da bir gizlilik politikası URL'si ister; bu dosyanın GitHub bağlantısı kullanılabilir (depo herkese açık olmalı).

---
© 2026 hakko. Tüm hakları saklıdır.
