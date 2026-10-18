import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { store } from '../store'
import {
  SECTIONS,
  HEADING_Z,
  HEADING_FONT_VW,
  HEADING_STEP,
  HEADING_BEND_R,
  HEADING_BEND_MAX,
  HEADING_TILT,
  HEADING_EXIT,
  HEADING_DROP,
  PAGE_SMOOTH,
  SNAP_DELAY,
  SNAP_STRENGTH,
} from '../config'

// Düzlemi silindire sarıyoruz. uSlot = (başlık sırası - sayfa): 0 ortada, +1 sağda, -1 solda bekliyor.
// Sonra başlığın kendi merkezi etrafında uTilt kadar döndürüyoruz, uLift kadar yukarı/aşağı kaydırıyoruz.
const VERT = /* glsl */ `
  uniform float uSlot;
  uniform float uStep;
  uniform float uCurv;
  uniform float uPhiMax;
  uniform float uTilt;
  uniform float uLift;
  varying vec2 vUv;

  // yay uzunluğu a -> (x, z). Silindire sarar, kıvrımın ötesi düz devam eder
  vec2 bend(float a, float k) {
    float x = a;
    float z = 0.0;
    if (k > 1e-4) {
      float am = uPhiMax / k;
      float aa = abs(a);
      float ph = min(aa, am) * k;
      x = sin(ph) / k;
      z = -(1.0 - cos(ph)) / k;
      float ex = max(aa - am, 0.0);
      x += ex * cos(uPhiMax);
      z -= ex * sin(uPhiMax);
      x *= sign(a);
    }
    return vec2(x, z);
  }

  void main() {
    vUv = uv;
    float k = uCurv * smoothstep(0.0, 1.0, abs(uSlot));
    float a0 = uSlot * uStep;           // başlığın merkezi
    vec2 p = bend(position.x + a0, k);  // bu köşe
    vec2 c = bend(a0, k);               // merkez

    // merkez etrafında döndür
    float dx = p.x - c.x;
    float cs = cos(uTilt);
    float sn = sin(uTilt);
    float x = c.x + dx * cs - position.y * sn;
    float y = dx * sn + position.y * cs + uLift;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(x, y, p.y, 1.0);
  }
`

// Dokunun sadece alfa kanalı kullanılır, renk sabit siyah
const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  varying vec2 vUv;
  void main() {
    float a = texture2D(uMap, vUv).a;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vec3(0.02), a);
  }
`

export default function Headings() {
  const camera = useThree((s) => s.camera)
  const viewport = useThree((s) => s.viewport)
  const size = useThree((s) => s.size)
  const dpr = viewport.dpr
  const meshes = useRef([])

  // Başlık derinliğinde ekranı tam dolduran düzlemin boyutu (dünya birimi)
  const { width: W, height: H } = useMemo(
    () => viewport.getCurrentViewport(camera, [0, 0, HEADING_Z], size),
    [viewport, camera, size]
  )

  const geometry = useMemo(() => new THREE.PlaneGeometry(W, H, 220, 1), [W, H])
  useEffect(() => () => geometry.dispose(), [geometry])

  // Her başlık için: kendi canvas'ı, dokusu ve malzemesi
  const items = useMemo(
    () =>
      SECTIONS.map(() => {
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = 2
        const texture = new THREE.CanvasTexture(canvas)
        texture.anisotropy = 8
        const material = new THREE.ShaderMaterial({
          vertexShader: VERT,
          fragmentShader: FRAG,
          side: THREE.DoubleSide,
          alphaToCoverage: true, // opak çizim kalır (cam görebilsin), kenarlar yumuşar
          uniforms: {
            uMap: { value: texture },
            uSlot: { value: 0 },
            uStep: { value: 1 },
            uCurv: { value: 0.1 },
            uPhiMax: { value: HEADING_BEND_MAX },
            uTilt: { value: 0 },
            uLift: { value: 0 },
          },
        })
        return { canvas, texture, material }
      }),
    []
  )

  // Başlıkları canvas'a çiz (eski Backdrop ile aynı yazı stili)
  useEffect(() => {
    let cancelled = false
    const draw = () => {
      const w = Math.min(Math.round(size.width * dpr), 4096)
      const h = Math.round((w * size.height) / size.width)
      const vw = w / 100
      const fs = (size.width < 700 ? 24 : HEADING_FONT_VW) * vw
      items.forEach((it, i) => {
        const { canvas, texture } = it
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, w, h)
        ctx.save()
        ctx.translate(w / 2, h / 2 - vw * 0.5)
        ctx.scale(1, 1.22)
        ctx.font = `400 ${fs}px Anton, Impact, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#fff'
        if ('letterSpacing' in ctx) ctx.letterSpacing = `${-0.01 * fs}px`
        ctx.fillText(SECTIONS[i].heading, 0, 0)
        ctx.restore()
        texture.dispose()
        texture.needsUpdate = true
      })
    }
    draw()
    if (document.fonts) {
      document.fonts.load('400 100px Anton').then(() => !cancelled && draw()).catch(() => {})
      document.fonts.ready.then(() => !cancelled && draw())
    }
    return () => {
      cancelled = true
    }
  }, [items, size.width, size.height, dpr])

    useFrame((_, dt) => {
    const now = performance.now()

    // Kaydırmayı bırakınca en yakın durağa otur (cam dağıldıktan sonra)
    if (store.target >= 0.999 && now - store.lastInput > SNAP_DELAY) {
      store.pageTarget += (Math.round(store.pageTarget) - store.pageTarget) * (1 - Math.exp(-dt * SNAP_STRENGTH))
    }
    // Yumuşatılmış sayfa değeri
    store.page += (store.pageTarget - store.page) * (1 - Math.exp(-dt * PAGE_SMOOTH))

    const last = SECTIONS.length - 1

    items.forEach((it, i) => {
      const mesh = meshes.current[i]
      if (!mesh) return
      const s = i - store.page
      const u = it.material.uniforms
      u.uStep.value = W * HEADING_STEP
      u.uCurv.value = 1 / (HEADING_BEND_R * W)
      u.uPhiMax.value = HEADING_BEND_MAX

      if (i === last && s < 0) {
        // Son başlık finalde sola kıvrılmaz, düz durup aşağı iner ve kaybolur
        const f = Math.min(-s, 1)
        const e = f * f * (3 - 2 * f)
        mesh.visible = f < 0.999
        u.uSlot.value = 0
        u.uTilt.value = 0
        u.uLift.value = -e * HEADING_EXIT * H
        return
      }

      mesh.visible = Math.abs(s) < 1.6 // ekran dışındakileri çizme
      const sc = Math.max(-1, Math.min(1, s))
      u.uSlot.value = s
      u.uTilt.value = -sc * HEADING_TILT
      u.uLift.value = -sc * HEADING_DROP * H
    })
  })

  return (
    <>
      {items.map((it, i) => (
        <mesh
          key={i}
          ref={(m) => (meshes.current[i] = m)}
          geometry={geometry}
          material={it.material}
          position={[0, 0, HEADING_Z]}
          frustumCulled={false} // köşeler kayıyor, kırpılmasın
        />
      ))}
    </>
  )
}