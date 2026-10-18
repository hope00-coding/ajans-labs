import { useEffect, useRef } from 'react'
import { store } from '../store'
import { SECTIONS } from '../config'

// Alttaki küçük paragraflar. Başlıkla aynı store.page değerini okur, yani eş zamanlı çalışır.
export default function Captions() {
  const refs = useRef([])

  useEffect(() => {
    let raf
    const loop = () => {
      // Kaydırma başlayınca alt çubuk kaybolurken paragraf belirir
      const master = Math.min(Math.max((store.value - 0.05) / 0.3, 0), 1)
      refs.current.forEach((el, i) => {
        if (!el) return
        const d = i - store.page // 0 = bu paragraf aktif
        const o = Math.max(0, 1 - Math.abs(d) / 0.5) * master
        el.style.opacity = o.toFixed(3)
        el.style.transform = `translateY(${(d * 14).toFixed(1)}px)`
      })
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="captions">
      {SECTIONS.map((s, i) => (
        <p key={i} ref={(el) => (refs.current[i] = el)}>
          {s.caption}
        </p>
      ))}
    </div>
  )
}