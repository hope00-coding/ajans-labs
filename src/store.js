import { MAX_PAGE } from './config'

export const store = {
  target: 0, // cam kürenin istediği değer (0..1)
  value: 0, // yumuşatılmış değer
  pageTarget: 0, // durak sırasının istediği değer (0..MAX_PAGE)
  page: 0, // yumuşatılmış durak sırası
  mouse: { x: 0, y: 0 },
  tint: [0.3, 0.6, 1], // anlık renk (JellyLight yazar, BackdropGlow okur)
  glow: 0, // arka plan yansıması şiddeti (JellyLight yazar, BackdropGlow okur)
  ringHover: false, // fare bir halkanın üstünde mi (Rings yazar, Cursor okur)
}

export const goToPage = (page, scatter = true) => {
  store.target = scatter ? 1 : 0
  store.pageTarget = Math.min(Math.max(page, 0), MAX_PAGE)
}

export const stepPage = (direction) => {
  const page = Math.round(store.pageTarget)
  if (store.target < 1 || (page === 0 && direction < 0)) {
    goToPage(0, direction > 0)
  } else {
    goToPage(page + direction)
  }
}

export const toggleScatter = () => {
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