import { useEffect } from 'react'
import { addScroll, store } from '../store'
import { SCROLL_SPEED } from '../config'

// İçinde kaydırılabilir alan varsa (iletişim sayfası) ve o alan henüz sınıra gelmediyse,
// sayfa durağını oynatma, tarayıcı o alanı kaydırsın.
const inScroll = (e, dy) => {
  const el = e.target?.closest?.('[data-scroll]')
  if (!el) return false
  if (el.scrollHeight <= el.clientHeight + 2) return false
  if (dy < 0 && el.scrollTop <= 0) return false
  if (dy > 0 && el.scrollTop + el.clientHeight >= el.scrollHeight - 2) return false
  return true
}

export default function useInput() {
  useEffect(() => {
    const onWheel = (e) => {
      if (inScroll(e, e.deltaY)) return
      e.preventDefault()
      addScroll(e.deltaY * SCROLL_SPEED)
    }

    let lastTouchY = null
    const onTouchStart = (e) => {
      lastTouchY = e.touches[0].clientY
    }
    const onTouchMove = (e) => {
      const y = e.touches[0].clientY
      if (lastTouchY !== null) {
        const dy = lastTouchY - y
        if (!inScroll(e, dy)) addScroll(dy * SCROLL_SPEED * 3)
      }
      lastTouchY = y
    }
    const onTouchEnd = () => {
      lastTouchY = null
    }

    const onKey = (e) => {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return
      if (e.code === 'ArrowDown' || e.code === 'PageDown' || e.code === 'Space') {
        e.preventDefault()
        addScroll(0.12)
      }
      if (e.code === 'ArrowUp' || e.code === 'PageUp') {
        e.preventDefault()
        addScroll(-0.12)
      }
    }

    const onPointerMove = (e) => {
      store.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      store.mouse.y = (e.clientY / window.innerHeight) * 2 - 1
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointermove', onPointerMove)

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [])
}