import { useEffect, useRef } from 'react'
import { goToPage, store } from '../store'
import { BUBBLES_PAGE, CONTACT_PAGE, OUTRO_TEXT, OUTRO_BUTTON } from '../config'

export default function Outro() {
  const ref = useRef(null)

  useEffect(() => {
    let raf
    const loop = () => {
      const el = ref.current
      if (el) {
        const p = store.page - BUBBLES_PAGE
        const o = Math.max(0, 1 - Math.abs(p) / 0.5)
        el.style.visibility = o > 0 ? 'visible' : 'hidden'
        el.style.opacity = o.toFixed(3)
        el.style.transform = `translate3d(0, ${(-p * 24).toFixed(1)}px, 0)`
        el.style.pointerEvents = o > 0.6 ? 'auto' : 'none'
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [])

  const go = () => goToPage(CONTACT_PAGE)

  return (
    <div className="outro" ref={ref}>
      <p>{OUTRO_TEXT}</p>
      <button type="button" onClick={go}>
        {OUTRO_BUTTON}
      </button>
    </div>
  )
}