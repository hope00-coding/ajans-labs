import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store } from '../store'
import {
  SECTIONS,
  MAX_PAGE,
  LIGHT_STOPS,
  LIGHT_INTENSITY,
  FINALE_LIGHT_BOOST,
  BG_GLOW_BASE,
  BG_GLOW_FINALE,
} from '../config'

// Denizanasına renkli ışık verir ve arka plan yansımasının rengini/şiddetini belirler.
// Işıklar cam küre dağılana kadar kapalı kalır, küre ilk haliyle görünür.
export default function JellyLight() {
  const a = useRef()
  const b = useRef()
  const c = useRef()
  const colors = useMemo(() => LIGHT_STOPS.map((s) => new THREE.Color(s)), [])
  const tmp = useMemo(() => new THREE.Color(), [])

  useFrame(() => {
    const p = Math.min(Math.max(store.page, 0), MAX_PAGE)
    const i = Math.floor(p)
    const j = Math.min(i + 1, MAX_PAGE)
    const t = p - i
    const e = t * t * (3 - 2 * t)
    tmp.copy(colors[i]).lerp(colors[j], e)

    const last = SECTIONS.length - 1
    const fin = Math.min(Math.max((store.page - last) / (MAX_PAGE - last), 0), 1) // 0..1 finalde
    const on = Math.min(Math.max((store.value - 0.7) / 0.3, 0), 1)

    const power = LIGHT_INTENSITY * on * (1 + FINALE_LIGHT_BOOST * fin)
    ;[a, b, c].forEach((r) => {
      if (!r.current) return
      r.current.color.copy(tmp)
      r.current.intensity = power
    })

    store.tint[0] = tmp.r
    store.tint[1] = tmp.g
    store.tint[2] = tmp.b
    store.glow = on * (BG_GLOW_BASE + (BG_GLOW_FINALE - BG_GLOW_BASE) * fin)
  })

  return (
    <>
      <directionalLight ref={a} position={[-4, 3, 5]} />
      <directionalLight ref={b} position={[4, -1, 4]} />
      <directionalLight ref={c} position={[0, 4, -3]} />
    </>
  )
}