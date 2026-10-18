import { useEffect, useRef } from 'react'
import { store } from '../store'
import { FINALE, SECTIONS } from '../config'

// Son başlıktan sonra çıkan sol ve sağ yazılar. Her biri kendi durağında görünür.
export default function Finale() {
  const refs = useRef([])
  const last = SECTIONS.length - 1

  useEffect(() => {
    let raf
    const loop = () => {
      FINALE.forEach((f, i) => {
        const el = refs.current[i]
        if (!el) return
        const d = store.page - (last + 1 + i) // 0 = bu yazı tam yerinde
        const o = Math.max(0, 1 - Math.abs(d) / 0.5)
        el.style.opacity = o.toFixed(3)
        el.style.transform = `translate3d(0, ${(-d * 24).toFixed(1)}px, 0)`
      })
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [last])

  return (
    <div className="finale">
      {FINALE.map((f, i) => (
        <div key={i} className={'blk ' + f.side}>
          <p ref={(el) => (refs.current[i] = el)}>{f.text}</p>
        </div>
      ))}
    </div>
  )
}