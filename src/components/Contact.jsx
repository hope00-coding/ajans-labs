import { useEffect, useRef, useState } from 'react'
import { store } from '../store'
import { CONTACT_PAGE, CONTACT } from '../config'

const EMPTY = { name: '', email: '', about: '', budget: '' }

export default function Contact() {
  const root = useRef(null)
  const [v, setV] = useState(EMPTY)
  const [touched, setTouched] = useState({})
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)

  // Sayfa durağına göre alttan kayarak gelir
  useEffect(() => {
    let raf
    const loop = () => {
      const el = root.current
      if (el) {
        const k = Math.min(Math.max(CONTACT_PAGE - store.page, 0), 1) // 1 = tamamen aşağıda
        el.style.transform = `translate3d(0, ${(k * 100).toFixed(2)}%, 0)`
        el.style.visibility = k >= 0.999 ? 'hidden' : 'visible'
        el.style.pointerEvents = k < 0.05 ? 'auto' : 'none'
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [])

  // Bütçe listesi açıkken dışarı tıklayınca kapanır
  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (e.target.closest?.('.budget-cell')) return
      setOpen(false)
      setTouched((t) => ({ ...t, budget: true }))
    }
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [open])

  const err = (k) => {
    const val = v[k].trim()
    if (!val) return CONTACT.errors[k]
    if (k === 'email' && !/^\S+@\S+\.\S+$/.test(val)) return CONTACT.errors.emailBad
    return ''
  }
  const show = (k) => (touched[k] ? err(k) : '')
  const set = (k) => (e) => {
    setSent(false)
    setV((s) => ({ ...s, [k]: e.target.value }))
  }
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }))

  const submit = () => {
    setTouched({ name: true, email: true, about: true, budget: true })
    if (['name', 'email', 'about', 'budget'].some((k) => err(k))) return
    // TODO: burada formu kendi servisinize gönderin (fetch('/api/iletisim', { method: 'POST', body: JSON.stringify(v) }))
    setSent(true)
    setV(EMPTY)
    setTouched({})
  }

  const field = (k, placeholder, type = 'text') => (
    <div className="ccell">
      <label className={'circle' + (show(k) ? ' bad' : '')}>
        <input
          type={type}
          value={v[k]}
          placeholder={placeholder}
          onChange={set(k)}
          onBlur={blur(k)}
          autoComplete={k === 'name' ? 'name' : k === 'email' ? 'email' : 'off'}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      </label>
      {show(k) && <div className="err">{show(k)}</div>}
    </div>
  )

  return (
    <section className="contact" ref={root} data-scroll>
      <h2>
        <span>{CONTACT.title1}</span>
        <span className="r">{CONTACT.title2}</span>
      </h2>

      <div className="circles">
        {field('name', CONTACT.name)}
        {field('email', CONTACT.email, 'email')}
        {field('about', CONTACT.about)}

        <div className="ccell budget-cell">
          <button
            type="button"
            className={'circle' + (open ? ' open' : '') + (!open && show('budget') ? ' bad' : '')}
            onClick={() => setOpen((o) => !o)}
          >
            <span>
              {v.budget || CONTACT.budget} <span className="tri">▲</span>
            </span>
          </button>
          {open && (
            <div className="menu">
              {CONTACT.budgets.map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() => {
                    setSent(false)
                    setV((s) => ({ ...s, budget: b }))
                    setTouched((t) => ({ ...t, budget: true }))
                    setOpen(false)
                  }}
                >
                  {b}
                </button>
              ))}
            </div>
          )}
          {!open && show('budget') && <div className="err">{show('budget')}</div>}
        </div>

        <div className="ccell">
          <button type="button" className="circle send" onClick={submit}>
            {sent ? CONTACT.sent : CONTACT.send}
          </button>
        </div>
      </div>

      <footer className="cfoot">
        <div className="col">
          <span className="big">{CONTACT.socialTitle}</span>
          <span className="mono">{CONTACT.copyright}</span>
        </div>
        <div className="col">
          {CONTACT.social.map((s) => (
            <a key={s.label} className="big" href={s.href} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
        </div>
      </footer>
    </section>
  )
}