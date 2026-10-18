import { useEffect, useRef, useState } from 'react'
import { store, toggleScatter } from '../store'
import { SECTIONS } from '../config'
import Captions from './Captions'
import Finale from './Finale'

export default function BottomBar() {
  const [soundOn, setSoundOn] = useState(true)
  const footerRef = useRef(null)
  const fillRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    let raf
    const loop = () => {
      const v = store.value

      // Kaydırma başlar başlamaz tüm alt kısım saydamlaşıp kaybolur (%8 kaydırmada tamamen)
      const f = 1 - Math.min(Math.max(v * 12, 0), 1)
      if (footerRef.current) {
        footerRef.current.style.opacity = f.toFixed(3)
        footerRef.current.style.pointerEvents = f < 0.05 ? 'none' : ''
      }

      const overall = (Math.min(v, 1) + store.page) / SECTIONS.length
      if (fillRef.current) fillRef.current.style.width = (overall * 100).toFixed(1) + '%'

      const idx = Math.min(Math.max(Math.round(store.page), 0), SECTIONS.length - 1)
      const label = v >= 0.98 ? SECTIONS[idx].tag : 'Aşağı kaydır'
      if (textRef.current && textRef.current.textContent !== label) {
        textRef.current.textContent = label
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <>
      <Captions />
       <Finale />
      <footer className="bottom" ref={footerRef}>
        <button
          className={'sound' + (soundOn ? '' : ' off')}
          aria-label="Ses"
          onClick={() => setSoundOn((s) => !s)}
        >
          <svg viewBox="0 0 46 22">
            <path d="M0 11 Q3 0 6 11 T12 11 T18 11 T24 11 T30 11 T36 11 T42 11 T46 11" />
            <path
              d="M0 11 Q3 22 6 11 T12 11 T18 11 T24 11 T30 11 T36 11 T42 11 T46 11"
              opacity=".6"
            />
          </svg>
          <span>{soundOn ? 'ON' : 'OFF'}</span>
        </button>

        <div className="mid">
          <div className="row">
            <span>Geleceğe adım atmaya hazır mısın?</span>
            <span ref={textRef}>Aşağı kaydır</span>
          </div>
          <div className="bar">
            <div className="fill" ref={fillRef} />
          </div>
        </div>

        <button className="skip" aria-label="Aşağı" onClick={toggleScatter}>
          <svg viewBox="0 0 24 24">
            <path d="M12 4v16M5 13l7 7 7-7" />
          </svg>
        </button>
      </footer>
    </>
  )
}