// Tüm ayarlar burada. Değiştirip kaydet, sayfa kendiliğinden yenilenir.

export const HEADING = 'AJANS LABS' // dev başlık (3D sahnenin arka planına çizilir)

/* ---------------- Cam küre ---------------- */
export const TILE_COUNT = 240 // küredeki cam panel sayısı
export const SPHERE_R = 1.75 // küre yarıçapı
export const TILE_TILT = 0.22 // panellerin rastgele eğimi (arkadaki yazıyı kırıp kaydırır)
export const GLASS_THICK = 1.5 // cam kalınlığı = kırılma/kayma miktarı
export const DISPERSION = 4 // kenarlardaki kırmızı/mavi renk ayrışması
export const SCROLL_SPEED = 0.0011 // kaydırma hassasiyeti

/* ---------------- Denizanası modeli ---------------- */
export const MODEL_URL = import.meta.env.BASE_URL + 'jellyfish.glb'
export const MODEL_SCALE = 1.5 // büyütme. Dışarı taşan kısım kürede kesilir (aşağıda CLIP_RADIUS)
export const MODEL_OFFSET = [0, 0, 0] // [sağ-sol, yukarı-aşağı, ileri-geri]
export const MODEL_ROTATION = [0, 0, 0] // radyan, baş aşağıysa [Math.PI, 0, 0]

// Kürenin dışına taşan kısımlar bu yarıçaptan sonra görünmez olur.
// Cam küre dağılırken bu sınır otomatik açılır, model tam boyuyla görünür.
export const CLIP_RADIUS = SPHERE_R - 0.12

/* ---------------- Neon görünüm ---------------- */
export const OVERRIDE_COLOR = false // true: modelin kendi malzemesi yerine neon boya. false: modelin kendi rengi
export const JELLY_COLOR = '#0781b5' // neon mavi. Pembe için '#ff3df2', yeşil için '#2bff9a'
export const JELLY_GLOW = 1.1 // iç parlaklık
export const RIM_GLOW = 1.8 // kenarlardaki ışıma (fresnel)
export const SPARKLE = 2.4 // parıl parıl ışıltı şiddeti (0 yaparsan kapanır)

/* ---------------- Su altı dalgalanması ---------------- */
// Genlik modelin boyuna oranıdır: 0.04 = boyun %4'ü kadar sallanır.
export const WAVE_AMP = 0.045
export const WAVE_SPEED = 1.5 // dalga hızı
export const WAVE_FREQ = 5.0 // dalga sıklığı (büyüdükçe daha fazla kıvrım)
export const BELL_PULSE = 0.06 // baş kısmının nefes alır gibi şişip inmesi



















/* ---------------- Bölümler: başlık + alttaki paragraf ---------------- */
// Yeni bölüm eklemek için bu diziye bir satır eklemen yeterli, gerisi otomatik.
export const SECTIONS = [
  { heading: HEADING, tag: 'Hoş geldin', light: '#4aa8ff', caption: 'İşletmenizi dijitalde bir adım öne taşıyoruz.' },
  { heading: 'TASARIM', tag: 'Tasarım', light: '#ff4fd8', caption: 'Modern ve özgün tasarım. Markanıza özel, sadece güzel görünen değil.' },
  { heading: 'DENEYİM', tag: 'Deneyim', light: '#35f0a0', caption: 'Telefon, tablet, bilgisayar. Tüm cihazlarda kusursuz deneyim.' },
  { heading: 'SONUÇ', tag: 'Sonuç', light: '#ffa040', caption: 'SEO uyumlu altyapı ve kolay yönetim paneli. Sonuç getiren web siteleri.' },
]

/* ---------------- Başlık geçişleri ---------------- */
export const PAGE_SPEED = 0.1 // kaydırma başına kaç sayfa ilerlesin (büyük = daha hızlı geçer)
export const PAGE_SMOOTH = 1 // yumuşatma (büyük = daha çabuk oturur)
export const SNAP_DELAY = 140 // ms: kaydırmayı bırakınca en yakın başlığa oturma gecikmesi
export const SNAP_STRENGTH = 6 // oturma hızı
export const HEADING_Z = -3 // başlıkların derinliği (denizanasının arkasında kalmalı, daha negatif = daha uzak)
export const HEADING_FONT_VW = 19.5 // başlık boyutu (ekran genişliği yüzdesi)
export const HEADING_STEP = 1.5 // iki başlık arası mesafe (ekran genişliği katı). Büyütürsen daha geç gelir
export const HEADING_BEND_R = 0.42 // kıvrım yarıçapı (ekran genişliği katı). Küçültürsen daha sert kıvrılır
export const HEADING_BEND_MAX = 0.6 // kıvrımın en fazla açısı (radyan). Büyütürsen daha çok geriye döner

/* ---------------- Denizanası dönüşü ---------------- */
export const SPIN_TURNS = 1 // bir başlık geçişinde kaç tur dönsün (0.5 = yarım tur)
export const SPIN_DIR = 1 // 1: aşağı kaydırınca soldan sağa döner, -1: ters



/* ---------------- Başlık eğimi ---------------- */
export const HEADING_TILT = 0.2 // radyan. Gelirken/giderken başlığın eğimi (0.2 ≈ 11 derece). 0 yaparsan eğim kapanır
export const HEADING_DROP = 0.1 // ekran yüksekliği oranı. Sağdan gelen aşağıdan başlar, soldan giden yukarı çıkar

/* ---------------- Denizanası ışığı ---------------- */
export const LIGHT_INTENSITY = 2.2 // renkli ışığın gücü. Çok güçlüyse düşür, 0 yaparsan kapanır

/* ---------------- Arka plan ---------------- */
export const BG_BASE = ['#eeeef7', '#dcdce9', '#cfd0e2'] // merkezden kenara gradyan
// x, y: 0..1 ekran konumu, r: yarıçap (ekranın büyük kenarına oranı), rgb: renk, a: yoğunluk
export const BG_BLOBS = [
  { x: 0.85, y: 0.12, r: 0.6, rgb: [140, 185, 245], a: 0.6 }, // sağ üst mavi
  { x: 0.1, y: 0.9, r: 0.55, rgb: [205, 160, 240], a: 0.5 }, // sol alt mor
  { x: 0.92, y: 0.88, r: 0.45, rgb: [245, 185, 210], a: 0.45 }, // sağ alt pembe
  { x: 0.08, y: 0.1, r: 0.45, rgb: [180, 205, 245], a: 0.45 }, // sol üst açık mavi
]
export const BG_DOT_SIZE = 6 // nokta aralığı (px)
export const BG_DOT_ALPHA = 0.9 // nokta belirginliği














/* ---------------- Final (son başlıktan sonra) ---------------- */
// Her satır bir durak: önce sol yazı, sonra sağ yazı.
export const FINALE = [
  { side: 'left', light: '#8a5cff', text: 'İşletmenizi dijitalde bir adım öne taşıyoruz. Modern, hızlı ve kullanıcı odaklı web siteleri.' },
  { side: 'right', light: '#ff5fa8', text: 'Sadece güzel görünen değil, sonuç getiren. SEO uyumlu altyapı ve kolay yönetim paneli.' },
]


export const HEADING_EXIT = 0.9 // son başlığın aşağı inme miktarı (ekran yüksekliği oranı)
export const FINALE_GROW = 0.35 // denizanası finalde yüzde kaç büyüsün (0.35 = %35)
export const FINALE_Z = 1.2 // denizanası kameraya ne kadar yaklaşsın
export const FINALE_LIGHT_BOOST = 0.6 // finalde renkli ışık ne kadar güçlensin
export const BG_GLOW_BASE = 0.25 // arka plandaki renkli yansımalar, başlıklar sırasında
export const BG_GLOW_FINALE = 0.8 // arka plandaki renkli yansımalar, finalde



export const FINALE_TOP_MARGIN = 0.2 // finalde denizanasının tepesiyle ekranın üstü arasındaki boşluk (yarım ekran yüksekliği oranı). Navbar'ı geçsin diye 0.2








/* ---------------- Halkalar (finalden sonra) ---------------- */
// title: dev başlık, code: "|" işaretinden sonraki kısa kod, desc: küçük açıklama, tags: sağdaki madde listesi
export const RINGS = [
  { title: 'WEB TASARIM', code: 'UI.UX', light: '#4aa8ff', desc: 'Markanıza özel, modern ve özgün arayüz tasarımı. Sadece güzel görünen değil, kullanıcıyı yönlendiren sayfalar.', tags: ['ÖZEL TASARIM', 'UI / UX', 'MARKA KİMLİĞİ'] },
  { title: 'SEO', code: 'SEO.01', light: '#35f0a0', desc: 'Arama motorlarında üst sıralara çıkmanızı sağlayan teknik altyapı ve temiz kod yapısı.', tags: ['TEKNİK SEO', 'HIZLI YÜKLEME', 'İÇERİK YAPISI'] },
  { title: 'E-TİCARET', code: 'SHOP', light: '#ff4fd8', desc: 'Hızlı, güvenli ve satış odaklı online mağazalar. Ödeme ve stok yönetimi dahil.', tags: ['ÖDEME ENTEGRASYONU', 'STOK TAKİBİ', 'GÜVENLİ ALTYAPI'] },
  { title: 'YÖNETİM PANELİ', code: 'PANEL', light: '#ffa040', desc: 'Kod bilmeden içeriklerinizi, görsellerinizi ve ürünlerinizi kolayca yönetin.', tags: ['KOLAY KULLANIM', 'İÇERİK YÖNETİMİ', 'RAPORLAMA'] },
  { title: 'MOBİL UYUM', code: 'RESP.', light: '#8a5cff', desc: 'Telefon, tablet ve bilgisayarda kusursuz görünen, her ekrana uyumlu deneyim.', tags: ['RESPONSIVE', 'DOKUNMATİK', 'HER CİHAZ'] },
  { title: '3D DENEYİM', code: '3D.JS', light: '#ff5fa8', desc: 'Three.js ile interaktif 3D sahneler ve akıcı animasyonlarla akılda kalan siteler.', tags: ['THREE.JS', 'ANİMASYON', 'İNTERAKTİF'] },
  { title: 'PERFORMANS', code: 'FAST', light: '#4aa8ff', desc: 'Işık hızında yüklenen, optimize edilmiş ve ölçeklenebilir web siteleri.', tags: ['OPTİMİZASYON', 'CDN', 'SKOR 100'] },
  { title: 'DESTEK', code: '24/7', light: '#35f0a0', desc: 'Yayına aldıktan sonra da yanınızdayız. Bakım, güncelleme ve sürekli destek.', tags: ['BAKIM', 'GÜNCELLEME', 'CANLI DESTEK'] },
]
export const RING_START = SECTIONS.length - 1 + FINALE.length // finalin son durağı
/* ---------------- Toplar + iletişim (halkalardan sonra) ---------------- */
export const RING_END = RING_START + RINGS.length
export const BUBBLES_PAGE = RING_END + 1 // toplar durağı
export const CONTACT_PAGE = BUBBLES_PAGE + 1 // iletişim durağı
export const MAX_PAGE = CONTACT_PAGE
export const LIGHT_STOPS = [
  ...SECTIONS.map((s) => s.light),
  ...FINALE.map((f) => f.light),
  ...RINGS.map((r) => r.light),
  '#8aa8ff', // toplar
  '#dfe8ff', // iletişim
]

export const BUBBLE_COUNT = 30 // masaüstünde top sayısı
export const BUBBLE_COUNT_MOBILE = 18 // mobilde top sayısı
export const BUBBLE_TEXT = 'AJANS LABS' // toplarla kapanan ortadaki yazı
export const BUBBLE_COLOR = '#c9d1e6' // top rengi
export const BUBBLE_REPEL = 30 // fare itme gücü (büyük = toplar daha sert kaçar)
export const BUBBLE_SPRING = 9 // toplanma hızı (büyük = daha çabuk geri döner)
export const BUBBLE_DAMP = 3.5 // sönümleme (küçük = daha çok sallanır)
export const OUTRO_TEXT = "AJANS LABS'TE TEKNOLOJİ YARATICILIKLA BULUŞUYOR. HER ETKİLEŞİM YENİ BİR FIRSAT."
export const OUTRO_BUTTON = 'MESAJ GÖNDER →'

export const CONTACT = {
  title1: 'BİRLİKTE HARİKA BİR ŞEY YARATALIM',
  title2: 'SADECE BİZE BİR MESAJ GÖNDERİN',
  name: '[ADINIZ]',
  email: '[E-POSTANIZ]',
  about: '[PROJENİZ NE HAKKINDA]',
  budget: 'PROJE BÜTÇESİ (TL)',
  send: 'GÖNDER →',
  sent: 'GÖNDERİLDİ ✓',
  errors: {
    name: 'AD GEREKLİ',
    email: 'E-POSTA GEREKLİ',
    emailBad: 'GEÇERLİ BİR E-POSTA GİRİN',
    about: 'PROJE BİLGİSİ GEREKLİ',
    budget: 'BÜTÇE SEÇİN',
  },
  budgets: ['10.000 TL ALTI', '10.000 - 25.000 TL', '25.000 - 50.000 TL', '50.000 TL ÜZERİ'],
  socialTitle: 'SOSYAL',
  copyright: '© TÜM HAKLARI SAKLIDIR',
  social: [
    { label: 'LINKEDIN', href: '#' },
    { label: 'INSTAGRAM', href: '#' },
  ],
}

export const RING_MONO = "'Space Mono', 'Courier New', monospace" // küçük yazı fontu. Sitenin mono fontunu buraya yaz
export const RING_HEIGHT = 1.5 // halka yüksekliği (dünya birimi)
export const RING_TEX_ASPECT = 8 // halka çevresi / yüksekliği. Büyürse halka daha geniş olur
export const RING_SPACING = 0.8 // iki halka arası mesafe (ekran yüksekliği oranı)
export const RING_HOVER_SCALE = 1.14 // fare üstüne gelince büyüme
export const RING_SPIN = 0.12 // kendi etrafında dönme hızı
export const RING_DRIFT = 0.06 // inerken sağa kayma (ekran genişliği oranı, 0 = düz iner)