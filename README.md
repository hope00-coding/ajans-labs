# Ajans Labs: giriş ekranı (Vite + React + React Three Fiber)

## Çalıştırma

```bash
npm install
npm run dev
```

Tarayıcıda terminalde yazan adresi aç (genelde http://localhost:5173).

## Dosya yapısı

```
src/
  config.js            -> tüm ayarlar (başlık, model yolu, panel sayısı, cam kalınlığı...)
  store.js             -> kaydırma ilerlemesi ve fare konumu
  hooks/useInput.js    -> tekerlek, dokunma, klavye, fare dinleyicisi
  components/
    Scene.jsx          -> Canvas ve sahne düzeni
    Backdrop.jsx       -> arka plan + dev başlık (3D arka plan dokusu)
    RoomEnv.jsx        -> cam yansımaları için ortam
    GlassSphere.jsx    -> cam panelli küre ve dağılma animasyonu
    Jellyfish.jsx      -> yedek denizanası ve .glb yükleyici
    CameraRig.jsx      -> mobilde kamera ayarı
    Navbar.jsx, BottomBar.jsx, Cursor.jsx
  styles.css
```

## Kendi denizanasını eklemek

1. Blender'dan modeli sıkıştırmasız GLB olarak dışa aktar ve `public/jellyfish.glb` dosyasını güncelle.
2. Proje dizininde `npx @gltf-transform/cli meshopt public/jellyfish.glb public/jellyfish-optimized.glb --level medium` çalıştır.
3. Yayın, optimize edilmiş dosyayı Vite'ın proje alt yolu üzerinden önceden yükler.

Model otomatik ortalanır ve küreye sığar. Büyük/küçük gelirse `MODEL_SCALE` ile ayarla.
Cam sadece opak nesneleri gördüğü için model malzemeleri opak yapılır (`FORCE_OPAQUE`).
