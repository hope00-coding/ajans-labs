import { PAGE_SPEED, MAX_PAGE } from './config'

export const store = {
  target: 0, // cam kürenin istediği değer (0..1)
  value: 0, // yumuşatılmış değer
  pageTarget: 0, // durak sırasının istediği değer (0..MAX_PAGE)
  page: 0, // yumuşatılmış durak sırası
  lastInput: 0, // son kaydırma zamanı (ms)
  mouse: { x: 0, y: 0 },
  tint: [0.3, 0.6, 1], // anlık renk (JellyLight yazar, BackdropGlow okur)
  glow: 0, // arka plan yansıması şiddeti (JellyLight yazar, BackdropGlow okur)
  ringHover: false, // fare bir halkanın üstünde mi (Rings yazar, Cursor okur)
}

// Hedef, görünen konumdan en fazla 1 durak ileri/geri gidebilir.
const limitPage = () => {
  const lo = Math.max(store.page - 1, 0)
  const hi = Math.min(store.page + 1, MAX_PAGE)
  store.pageTarget = Math.min(Math.max(store.pageTarget, lo), hi)
}

export const addScroll = (delta) => {
  store.lastInput = performance.now()

  if (delta > 0) {
    const room = 1 - store.target
    const use = Math.min(delta, room)
    store.target = use === room ? 1 : store.target + use
    const rest = delta - use
    if (rest > 0) {
      store.pageTarget = Math.min(store.pageTarget + rest * PAGE_SPEED, MAX_PAGE)
      limitPage()
    }
  } else if (delta < 0) {
    const pageUnits = store.pageTarget / PAGE_SPEED
    const use = Math.min(-delta, pageUnits)
    store.pageTarget = Math.max(store.pageTarget - use * PAGE_SPEED, 0)
    limitPage()
    const rest = -delta - use
    if (rest > 0) store.target = Math.max(store.target - rest, 0)
  }
}

export const toggleScatter = () => {
  store.lastInput = performance.now()
  if (store.target < 0.999) {
    store.target = 1
    return
  }
  const next = Math.round(store.pageTarget) + 1
  if (next > MAX_PAGE) {
    store.pageTarget = 0
    store.target = 0
  } else {
    store.pageTarget = next
  }
}