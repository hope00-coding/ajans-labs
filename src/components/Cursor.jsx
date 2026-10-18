import { useEffect, useRef } from 'react'
import { store } from '../store'

// Beyaz yuvarlak özel imleç. Halkanın üstünde "VIEW CASE" olur.
export default function Cursor() {
  const ref = useRef(null)

  useEffect(() => {
    const move = (e) => {
      if (!ref.current) return
      ref.current.style.left = e.clientX + 'px'
      ref.current.style.top = e.clientY + 'px'
    }
    let raf
    const loop = () => {
      if (ref.current) ref.current.classList.toggle('view', store.ringHover)
      raf = requestAnimationFrame(loop)
    }
    loop()
    window.addEventListener('pointermove', move)
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div id="cursor" ref={ref}>
      <span>VIEW<br />CASE</span>
    </div>
  )
}