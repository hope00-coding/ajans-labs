import { useEffect } from 'react'
import { addScroll, goToPage, store } from '../store'
import { MAX_PAGE, SCROLL_SPEED } from '../config'

const scrollArea = (e) => e.target?.closest?.('[data-scroll]')
const dialogOpen = () => document.querySelector('dialog[open]')
const canScroll = (el, dy) => el && (
  dy < 0 ? el.scrollTop > 1 : el.scrollTop + el.clientHeight < el.scrollHeight - 1
)

export default function useInput() {
  useEffect(() => {
    let gesture = null
    let wheelTimer
    let wheelStart = null

    const onWheel = (e) => {
      if (e.ctrlKey || dialogOpen() || canScroll(scrollArea(e), e.deltaY)) return
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      e.preventDefault()
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1
      const distance = e.deltaY * unit
      if (wheelStart === null) {
        wheelStart = { page: Math.round(store.pageTarget), distance: 0, scatter: store.target }
      }
      wheelStart.distance += distance
      addScroll(distance * SCROLL_SPEED)
      const lastInput = store.lastInput
      clearTimeout(wheelTimer)
      wheelTimer = setTimeout(() => {
        const start = wheelStart
        wheelStart = null
        if (store.lastInput !== lastInput || dialogOpen() || start.scatter < 1 || store.target < 1) return
        if (Math.abs(start.distance) >= 40 && Math.round(store.pageTarget) === start.page) {
          goToPage(start.page + Math.sign(start.distance))
        }
      }, 110)
    }

    const onTouchStart = (e) => {
      gesture = null
      if (e.touches.length !== 1 || dialogOpen()) return
      const { clientX: x, clientY: y } = e.touches[0]
      gesture = { x, y, area: scrollArea(e), scatter: store.target, page: Math.round(store.pageTarget), moving: false }
    }

    const onTouchMove = (e) => {
      if (!gesture || e.touches.length !== 1) {
        gesture = null
        return
      }
      const dy = gesture.y - e.touches[0].clientY
      if (!gesture.moving) {
        const dx = e.touches[0].clientX - gesture.x
        if (Math.abs(dy) < 12) return
        if (Math.abs(dx) > Math.abs(dy) || canScroll(gesture.area, dy)) {
          gesture = null
          return
        }
        gesture.moving = true
      }
      if (e.cancelable) e.preventDefault()
      gesture.distance = dy
      store.lastInput = performance.now()
      const progress = Math.max(-1, Math.min(1, dy / Math.min(190, window.innerHeight * 0.32)))
      if (gesture.scatter < 1 || (gesture.page === 0 && dy < 0)) {
        store.target = Math.max(0, Math.min(1, gesture.scatter + progress))
      } else {
        store.pageTarget = Math.max(0, Math.min(MAX_PAGE, gesture.page + progress))
      }
    }

    const finishTouch = (e) => {
      if (gesture?.moving) {
        const distance = gesture.distance
        const direction = e.type === 'touchcancel' || Math.abs(distance) < 32 ? 0 : Math.sign(distance)
        if (gesture.scatter < 1 || (gesture.page === 0 && distance < 0)) {
          goToPage(0, direction > 0 || (direction === 0 && gesture.scatter >= 0.5))
        } else {
          goToPage(gesture.page + direction)
        }
      }
      gesture = null
    }

    const onKey = (e) => {
      if (dialogOpen() || e.target?.closest?.('input, textarea, select, button, a, [contenteditable]')) return
      const down = ['ArrowDown', 'PageDown', 'Space'].includes(e.code)
      const up = ['ArrowUp', 'PageUp'].includes(e.code)
      if (!down && !up) return
      const direction = up || e.shiftKey ? -1 : 1
      if (canScroll(scrollArea(e), direction)) return
      e.preventDefault()
      const page = Math.round(store.pageTarget)
      if (store.target < 1 || (page === 0 && direction < 0)) {
        goToPage(0, direction > 0)
      } else {
        goToPage(page + direction)
      }
    }

    const onPointerMove = (e) => {
      if (e.pointerType === 'touch') return
      store.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      store.mouse.y = (e.clientY / window.innerHeight) * 2 - 1
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', finishTouch)
    window.addEventListener('touchcancel', finishTouch)
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointermove', onPointerMove)
    return () => {
      clearTimeout(wheelTimer)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', finishTouch)
      window.removeEventListener('touchcancel', finishTouch)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [])
}
