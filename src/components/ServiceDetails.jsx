import { useEffect, useRef, useState } from 'react'
import { CONTACT_PAGE, HEADING, RINGS, RING_START } from '../config'
import { goToPage, store } from '../store'

export function RingControls({ onService }) {
  const [index, setIndex] = useState(-1)

  useEffect(() => {
    let frame
    let previous = -1
    const update = () => {
      const position = store.page - RING_START - 1
      const center = Math.round(position)
      const active = center >= 0 && center < RINGS.length ? center : -1
      if (active !== previous) {
        previous = active
        setIndex(active)
      }
      frame = requestAnimationFrame(update)
    }
    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [])

  if (index < 0) return null

  const move = (direction) => {
    const target = Math.round(store.pageTarget)
    goToPage(Math.min(RING_START + RINGS.length + 1, Math.max(RING_START, target + direction)))
  }

  return (
    <div className="ring-controls" aria-label="Hizmetler arasında gezin">
      <button type="button" aria-label="Önceki bölüm" onClick={() => move(-1)}>↑</button>
      <button type="button" onClick={() => onService(index)} aria-label={RINGS[index].title + ' hizmetini incele'}>
        HİZMETİ İNCELE
      </button>
      <button type="button" aria-label="Sonraki bölüm" onClick={() => move(1)}>↓</button>
    </div>
  )
}

export default function ServiceDetails({ selection, onSelect, onClose }) {
  const ref = useRef(null)
  const scrollRef = useRef(null)
  const ring = RINGS[selection]

  useEffect(() => {
    const dialog = ref.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  useEffect(() => {
    scrollRef.current.scrollTop = 0
  }, [selection])

  const move = (direction) => {
    const next = selection + direction
    goToPage(RING_START + next + 1)
    onSelect(next)
  }

  return (
    <dialog
      ref={ref}
      className="details"
      aria-labelledby="detail-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
    >
      <div className="details-inner" data-scroll ref={scrollRef}>
        <div className="details-top">
          <span>{ring ? ring.code : HEADING}</span>
          <button type="button" onClick={onClose} autoFocus aria-label="Kapat">×</button>
        </div>
        {ring ? (
          <>
            <h2 id="detail-title">{ring.title}</h2>
            <p>{ring.desc}</p>
            <p>{ring.scope}</p>
            <ul className="details-tags">
              {ring.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
            <figure>
              <img src={import.meta.env.BASE_URL + 'services/' + ring.image + '.webp'} alt="" width="800" height="500" />
              <figcaption>Temsili görsel</figcaption>
            </figure>
            <div className="details-actions">
              <button type="button" disabled={selection === 0} onClick={() => move(-1)}>← Önceki hizmet</button>
              <a href="https://thefuel.agency/portfolio/" target="_blank" rel="noreferrer">Fuel portföyü ↗</a>
              <button type="button" disabled={selection === RINGS.length - 1} onClick={() => move(1)}>Sonraki hizmet →</button>
            </div>
          </>
        ) : (
          <>
            <h2 id="detail-title">THE FUEL AGENCY</h2>
            <p>The Fuel Agency, Girne merkezli bir marka tasarımı, yazılım geliştirme, dijital pazarlama ve prodüksiyon ajansı.</p>
            <p>Bu bağımsız konsept site, ajansın hizmetlerini etkileşimli bir 3D deneyimde bir araya getiriyor.</p>
            <div className="details-actions">
              <a href="https://thefuel.agency/" target="_blank" rel="noreferrer">Resmî site ↗</a>
              <button type="button" onClick={() => {
                goToPage(RING_START + 1)
                onClose()
              }}>Hizmetleri keşfet →</button>
              <button type="button" onClick={() => {
                goToPage(CONTACT_PAGE)
                onClose()
              }}>Proje brifi →</button>
            </div>
          </>
        )}
      </div>
    </dialog>
  )
}
