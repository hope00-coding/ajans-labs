import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { store } from '../store'
import {
  RINGS,
  RING_START,
  RING_MONO,
  RING_HEIGHT,
  RING_TEX_ASPECT,
  RING_SPACING,
  RING_HOVER_SCALE,
  RING_SPIN,
  RING_DRIFT,
} from '../config'

const TEX_W = 4096
const TEX_H = 512
const R = (RING_TEX_ASPECT * RING_HEIGHT) / (2 * Math.PI) // yarıçap, çevre = aspect * yükseklik

const VERT = /* glsl */ `
  varying vec2 vUv;
  varying float vNdv;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normal);
    vNdv = abs(dot(n, normalize(-mv.xyz)));
    gl_Position = projectionMatrix * mv;
  }
`

// Ön yüz: net yazı, kenarlarda tanecikli dağılma. Arka yüz (içeriden görünen): bulanık + grenli, ters yazı.
const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uBack;
  uniform vec3 uTint;
  uniform vec2 uTexel;
  varying vec2 vUv;
  varying float vNdv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    float a = texture2D(uMap, vUv).a;
    float g = hash(gl_FragCoord.xy);
    float m;
    if (uBack > 0.5) {
      float s = a;
      for (int i = 0; i < 8; i++) {
        float ang = float(i) * 0.785398;
        s += texture2D(uMap, vUv + vec2(cos(ang), sin(ang)) * uTexel * 7.0).a;
      }
      s /= 9.0;
      m = smoothstep(0.30, 0.62, s + (g - 0.5) * 0.45) * 0.85;
    } else {
      m = a * smoothstep(0.05, 0.55, vNdv + (g - 0.5) * 0.35);
    }

    float fres = pow(1.0 - vNdv, 2.5);
    vec3 glass = mix(vec3(0.97, 0.98, 1.0), uTint, 0.35 * fres);
    float glassA = (uBack > 0.5 ? 0.10 : 0.14) + fres * 0.35;
    float edge = 1.0 - smoothstep(0.0, 0.012, min(vUv.y, 1.0 - vUv.y));

    vec3 col = mix(glass, vec3(0.03), max(m, edge * 0.7));
    float alpha = max(max(glassA, m), edge * 0.7);
    gl_FragColor = vec4(col, alpha);
  }
`

// Halkanın yazı dokusunu çizer. Aynı desen çevrede 2 kez tekrarlanır.
function drawRing(canvas, ring) {
  canvas.width = TEX_W
  canvas.height = TEX_H
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, TEX_W, TEX_H)
  ctx.fillStyle = '#fff'
  ctx.textBaseline = 'middle'

  const SW = TEX_W / 2
  const title = ring.title.toLocaleUpperCase('tr')
  const code = ring.code.toLocaleUpperCase('tr')

  let fs = 230
  const setFont = () => (ctx.font = `400 ${fs}px Anton, Impact, sans-serif`)
  const measure = () => {
    setFont()
    const wT = ctx.measureText(title).width
    const wC = ctx.measureText(code).width
    return { wT, wC, gap: fs * 0.22, barW: fs * 0.07, total: wT + wC + fs * 0.22 * 2 + fs * 0.07 }
  }
  let m = measure()
  const maxW = SW - 160
  if (m.total > maxW) {
    fs *= maxW / m.total
    m = measure()
  }

  // küçük açıklama satırları
  const words = ring.desc.toLocaleUpperCase('tr').split(' ')
  const lines = []
  ctx.font = `400 26px ${RING_MONO}`
  let line = ''
  words.forEach((w) => {
    const test = line ? line + ' ' + w : w
    if (ctx.measureText(test).width > 820 && line) {
      lines.push(line)
      line = w
    } else line = test
  })
  if (line) lines.push(line)

  for (let seg = 0; seg < 2; seg++) {
    const ox = seg * SW + 80
    const ty = TEX_H * 0.34

    setFont()
    ctx.fillText(title, ox, ty)
    ctx.fillRect(ox + m.wT + m.gap, ty - fs * 0.38, m.barW, fs * 0.76)
    ctx.fillText(code, ox + m.wT + m.gap * 2 + m.barW, ty)

    ctx.font = `400 26px ${RING_MONO}`
    lines.slice(0, 4).forEach((l, k) => ctx.fillText(l, ox + 20, TEX_H * 0.7 + k * 32))
    ring.tags.slice(0, 4).forEach((t, k) => ctx.fillText('• ' + t, ox + 920, TEX_H * 0.7 + k * 32))
  }
}

const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1)
blank.needsUpdate = true

export default function Rings() {
  const viewport = useThree((s) => s.viewport)
  const camera = useThree((s) => s.camera)
  const groups = useRef([])
  const fronts = useRef([])
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const touch = useMemo(() => window.matchMedia('(hover: none)').matches, [])

  const geometry = useMemo(() => new THREE.CylinderGeometry(R, R, RING_HEIGHT, 96, 1, true), [])

  const items = useMemo(
    () =>
      RINGS.map((ring) => {
        const mk = (back) =>
          new THREE.ShaderMaterial({
            vertexShader: VERT,
            fragmentShader: FRAG,
            transparent: true,
            depthWrite: false,
            side: back ? THREE.BackSide : THREE.FrontSide,
            uniforms: {
              uMap: { value: blank },
              uBack: { value: back ? 1 : 0 },
              uTint: { value: new THREE.Color(ring.light) },
              uTexel: { value: new THREE.Vector2(1 / TEX_W, 1 / TEX_H) },
            },
          })
        return { tex: null, hover: 0, back: mk(true), front: mk(false) }
      }),
    []
  )

  useEffect(
    () => () => {
      geometry.dispose()
      items.forEach((it) => {
        it.tex?.dispose()
        it.back.dispose()
        it.front.dispose()
      })
    },
    [geometry, items]
  )

  const load = (it, ring) => {
    if (it.tex) return
    const canvas = document.createElement('canvas')
    drawRing(canvas, ring)
    const tex = new THREE.CanvasTexture(canvas)
    tex.anisotropy = 8
    tex.wrapS = THREE.RepeatWrapping
    it.tex = tex
    it.back.uniforms.uMap.value = tex
    it.front.uniforms.uMap.value = tex
  }
  const unload = (it) => {
    if (!it.tex) return
    it.tex.dispose()
    it.tex = null
    it.back.uniforms.uMap.value = blank
    it.front.uniforms.uMap.value = blank
  }

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const ringP = store.page - RING_START
    const vw = viewport.width
    const vh = viewport.height
    const portrait = vw < vh
    const base = Math.min((vw * (portrait ? 1.15 : 0.62)) / (2 * R), 1.6)
    const stretch = portrait ? 1.5 : 1 // mobilde halka dikeyde biraz uzar
    const S = vh * RING_SPACING
    const t = performance.now() / 1000

    // fare hangi halkanın üstünde
    let hit = -1
    if (!touch && ringP > -0.6) {
      ndc.set(store.mouse.x, -store.mouse.y)
      raycaster.setFromCamera(ndc, camera)
      let best = Infinity
      items.forEach((_, i) => {
        const g = groups.current[i]
        const f = fronts.current[i]
        if (!g || !f || !g.visible || Math.abs(i + 1 - ringP) > 0.8) return
        const h = raycaster.intersectObject(f, false)
        if (h.length && h[0].distance < best) {
          best = h[0].distance
          hit = i
        }
      })
    }
    store.ringHover = hit >= 0

    items.forEach((it, i) => {
      const g = groups.current[i]
      if (!g) return
      const d = i + 1 - ringP // 0 = ekranın ortasında, +1 = bir halka yukarıda

      if (Math.abs(d) < 2.2) load(it, RINGS[i])
      else unload(it)

      g.visible = Math.abs(d) < 1.6
      if (!g.visible) return

      const active = hit === i || (touch && Math.abs(d) < 0.35)
      it.hover += ((active ? 1 : 0) - it.hover) * (1 - Math.exp(-dt * 8))
      const sc = base * (1 + (RING_HOVER_SCALE - 1) * it.hover)
      const dirn = i % 2 ? -1 : 1

      g.position.set(-d * vw * RING_DRIFT, d * S, 0)
      g.scale.set(sc, sc * stretch, sc)
      g.rotation.order = 'ZYX'
      g.rotation.z = -d * 0.08
      g.rotation.y = dirn * (t * RING_SPIN + ringP * 1.4) + i * 1.3
    })
  })

  return (
    <>
      {items.map((it, i) => (
        <group key={i} ref={(el) => (groups.current[i] = el)} visible={false}>
          <mesh geometry={geometry} material={it.back} renderOrder={1} frustumCulled={false} />
          <mesh
            ref={(el) => (fronts.current[i] = el)}
            geometry={geometry}
            material={it.front}
            renderOrder={3}
            frustumCulled={false}
          />
        </group>
      ))}
    </>
  )
}