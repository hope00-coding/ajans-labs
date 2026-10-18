import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { store } from '../store'
import {
  BUBBLES_PAGE,
  BUBBLE_COUNT,
  BUBBLE_COUNT_MOBILE,
  BUBBLE_TEXT,
  BUBBLE_COLOR,
  BUBBLE_REPEL,
  BUBBLE_SPRING,
  BUBBLE_DAMP,
} from '../config'

const rnd = (a, b) => a + Math.random() * (b - a)
const FAR = 1e4
const TEXT_Z = -2.2

export default function Bubbles() {
  const viewport = useThree((s) => s.viewport)
  const size = useThree((s) => s.size)
  const group = useRef()
  const mesh = useRef()
  const textMesh = useRef()
  const mobile = size.width < 700
  const count = mobile ? BUBBLE_COUNT_MOBILE : BUBBLE_COUNT

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 48, 32), [])

  // Her topun "ev" konumu (ekran oranı olarak), yarıçapı, anlık konumu ve hızı
  const balls = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const a = Math.random() * Math.PI * 2
        const r = Math.sqrt(Math.random())
        return {
          hx: Math.cos(a) * r * 0.42,
          hy: Math.sin(a) * r * 0.4,
          hz: rnd(-0.25, 0.35),
          rn: rnd(0.06, 0.14),
          p: new THREE.Vector3(),
          v: new THREE.Vector3(),
          init: false,
        }
      }),
    [count]
  )

  // Ortadaki yazının dokusu
  const text = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 512
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    return { canvas, texture }
  }, [])

  useEffect(() => {
    let cancelled = false
    const draw = () => {
      const { canvas, texture } = text
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#0a0a0a'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      let fs = 420
      ctx.font = `400 ${fs}px Anton, Impact, sans-serif`
      const w = ctx.measureText(BUBBLE_TEXT).width
      if (w > 1900) {
        fs *= 1900 / w
        ctx.font = `400 ${fs}px Anton, Impact, sans-serif`
      }
      ctx.fillText(BUBBLE_TEXT, canvas.width / 2, canvas.height / 2)
      texture.needsUpdate = true
    }
    draw()
    if (document.fonts) {
      document.fonts.load('400 100px Anton').then(() => !cancelled && draw()).catch(() => {})
      document.fonts.ready.then(() => !cancelled && draw())
    }
    return () => {
      cancelled = true
    }
  }, [text])

  useEffect(
    () => () => {
      geometry.dispose()
      text.texture.dispose()
    },
    [geometry, text]
  )

  useFrame((_, delta) => {
    const g = group.current
    const m = mesh.current
    if (!g || !m) return

    const d = BUBBLES_PAGE - store.page // +: yukarıdan geliyor, 0: ortada, -: yukarı çıkıyor
    g.visible = Math.abs(d) < 1.5
    if (!g.visible) return

    const dt = Math.min(delta, 0.04)
    const vw = viewport.width
    const vh = viewport.height
    const s = Math.min(vw * 0.55, vh) // top boyutlarının ölçeği
    g.position.y = Math.abs(d) * vh * 1.1

    // Ortadaki yazı
    if (textMesh.current) {
      const w = vw * (mobile ? 0.92 : 0.8) * ((7 - TEXT_Z) / 7)
      textMesh.current.scale.set(w, w / 4, 1)
    }

    // Fare (grubun yerel koordinatında). Toplar sayfada değilken devre dışı.
    const active = Math.abs(d) < 0.6
    const mx = active ? (store.mouse.x * vw) / 2 : FAR
    const my = active ? (-store.mouse.y * vh) / 2 - g.position.y : FAR
    const mr = s * 0.28
    const force = BUBBLE_REPEL * s

    const steps = 2
    const h = dt / steps
    for (let k = 0; k < steps; k++) {
      for (const b of balls) {
        const r = b.rn * s
        const hx = b.hx * vw
        const hy = b.hy * vh
        const hz = b.hz * s
        if (!b.init) {
          b.p.set(hx, hy, hz)
          b.init = true
        }
        let ax = (hx - b.p.x) * BUBBLE_SPRING - b.v.x * BUBBLE_DAMP
        let ay = (hy - b.p.y) * BUBBLE_SPRING - b.v.y * BUBBLE_DAMP
        const az = (hz - b.p.z) * BUBBLE_SPRING - b.v.z * BUBBLE_DAMP

        // fareden kaç
        const dx = b.p.x - mx
        const dy = b.p.y - my
        const dist = Math.hypot(dx, dy) + 1e-4
        const reach = r + mr
        if (dist < reach) {
          const t = 1 - dist / reach
          const f = t * t * force
          ax += (dx / dist) * f
          ay += (dy / dist) * f
        }

        b.v.x += ax * h
        b.v.y += ay * h
        b.v.z += az * h
        b.p.x += b.v.x * h
        b.p.y += b.v.y * h
        b.p.z += b.v.z * h
      }

      // toplar birbirinin içinden geçmesin
      for (let i = 0; i < balls.length; i++) {
        const a = balls[i]
        const ra = a.rn * s
        for (let j = i + 1; j < balls.length; j++) {
          const b = balls[j]
          const dx = a.p.x - b.p.x
          const dy = a.p.y - b.p.y
          const dz = a.p.z - b.p.z
          const min = ra + b.rn * s
          const d2 = dx * dx + dy * dy + dz * dz
          if (d2 >= min * min || d2 < 1e-8) continue
          const dist = Math.sqrt(d2)
          const nx = dx / dist
          const ny = dy / dist
          const nz = dz / dist
          const push = (min - dist) * 0.5
          a.p.x += nx * push
          a.p.y += ny * push
          a.p.z += nz * push
          b.p.x -= nx * push
          b.p.y -= ny * push
          b.p.z -= nz * push
          const rel = (a.v.x - b.v.x) * nx + (a.v.y - b.v.y) * ny + (a.v.z - b.v.z) * nz
          if (rel < 0) {
            const imp = -rel * 0.7
            a.v.x += nx * imp
            a.v.y += ny * imp
            a.v.z += nz * imp
            b.v.x -= nx * imp
            b.v.y -= ny * imp
            b.v.z -= nz * imp
          }
        }
      }
    }

    for (let i = 0; i < balls.length; i++) {
      const b = balls[i]
      dummy.position.copy(b.p)
      dummy.scale.setScalar(b.rn * s)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <group ref={group} visible={false}>
      <mesh ref={textMesh} position={[0, 0, TEXT_Z]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={text.texture} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <instancedMesh key={count} ref={mesh} args={[geometry, undefined, count]} frustumCulled={false}>
        <meshPhysicalMaterial
          color={BUBBLE_COLOR}
          roughness={0.22}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.3}
        />
      </instancedMesh>
    </group>
  )
}