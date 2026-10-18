import { Component, Suspense, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import {
  MODEL_URL,
  MODEL_SCALE,
  MODEL_OFFSET,
  MODEL_ROTATION,
  CLIP_RADIUS,
  OVERRIDE_COLOR,
  JELLY_COLOR,
  JELLY_GLOW,
  RIM_GLOW,
  SPARKLE,
  WAVE_AMP,
  WAVE_SPEED,
  WAVE_FREQ,
  BELL_PULSE,
} from '../config'
import { store } from '../store'

// Not: cam (transmission) sadece opak nesneleri görebilir, o yüzden denizanası opak.

const f = (n) => Number(n).toFixed(4) // sayıyı shader'a yazmak için

const smooth = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

/* ---------------- Shader parçaları ---------------- */
const VERT_DECL = /* glsl */ `
  uniform float uTime;
  uniform vec3 uBoxMin;
  uniform vec3 uBoxSize;
  uniform float uSize;
  varying vec3 vWPos;
`

// Statik modeli suyun altındaymış gibi büküp esnetir (sinüs dalgaları).
// Üstte (baş) az, aşağıya (dokunaçlara) doğru giderek daha çok sallanır.
const VERT_WAVE = /* glsl */ `
  {
    float ty = clamp((transformed.y - uBoxMin.y) / max(uBoxSize.y, 0.0001), 0.0, 1.0);
    float w = 0.15 + 0.85 * pow(1.0 - ty, 1.4);
    vec3 q = (transformed - uBoxMin) / max(uSize, 0.0001);
    float t = uTime * ${f(WAVE_SPEED)};
    float fq = ${f(WAVE_FREQ)};

    // baş kısmı nefes alır gibi şişip iner
    float pul = sin(t * 1.0);
    vec2 cxz = uBoxMin.xz + uBoxSize.xz * 0.5;
    transformed.xz = cxz + (transformed.xz - cxz) * (1.0 + pul * ${f(BELL_PULSE)} * smoothstep(0.45, 1.0, ty));

    // 3 eksende üst üste binen sinüs dalgaları
    vec3 d = vec3(
      sin(q.y * fq + t) + 0.5 * sin(q.z * fq * 1.7 - t * 1.3),
      0.35 * sin(q.x * fq * 1.3 + q.z * fq + t * 0.8),
      sin(q.y * fq * 1.2 - t * 1.1) + 0.5 * sin(q.x * fq * 1.9 + t * 1.5)
    );
    transformed += d * w * ${f(WAVE_AMP)} * uSize;
  }
`

const FRAG_DECL = /* glsl */ `
  uniform float uTime;
  uniform float uClip;
  varying vec3 vWPos;
`

// Neon kenar ışıması + parıl parıl ışıltı
const FRAG_GLOW = /* glsl */ `
  {
    vec3 Vv = normalize(vViewPosition);
    float fres = pow(1.0 - clamp(abs(dot(normal, Vv)), 0.0, 1.0), 2.2);
    totalEmissiveRadiance += vec3(0.45, 0.9, 1.0) * fres * ${f(RIM_GLOW)};

    float tw = sin(vWPos.x * 19.0 + uTime * 2.6) * sin(vWPos.y * 23.0 - uTime * 2.1) * sin(vWPos.z * 17.0 + uTime * 3.1);
    tw = pow(max(tw, 0.0), 5.0);
    totalEmissiveRadiance += vec3(0.75, 0.97, 1.0) * tw * ${f(SPARKLE)};

    totalEmissiveRadiance *= 0.88 + 0.12 * sin(uTime * 1.4);
  }
`

function patchMaterial(mat, uniforms) {
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${VERT_DECL}`)
      .replace('#include <displacementmap_vertex>', `#include <displacementmap_vertex>\n${VERT_WAVE}`)
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>\n vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
      )

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${FRAG_DECL}`)
      // küre dışına taşan kısımları görünmez yap
      .replace('void main() {', 'void main() {\n  if (length(vWPos) > uClip) discard;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n${FRAG_GLOW}`)
  }
  mat.customProgramCacheKey = () => 'jelly-neon-v1'
  mat.needsUpdate = true
}

/* ---------------- Kendi Blender modelin (.glb) ---------------- */
function GltfModel({ url }) {
  const { scene, animations } = useGLTF(url)
  const holder = useRef()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uClip: { value: CLIP_RADIUS },
      uBoxMin: { value: new THREE.Vector3() },
      uBoxSize: { value: new THREE.Vector3(1, 1, 1) },
      uSize: { value: 1 },
    }),
    []
  )

  // sahneyi kopyala, boya, ortala ve kürenin içine sığacak boyuta getir
  const model = useMemo(() => {
    const m = SkeletonUtils.clone(scene)

    // dalga hesabı için modelin kendi (yerel) sınır kutusu
    const local = new THREE.Box3()
    m.traverse((o) => {
      if (o.isMesh && o.geometry) {
        o.geometry.computeBoundingBox()
        local.union(o.geometry.boundingBox)
      }
    })
    if (!local.isEmpty()) {
      const s = local.getSize(new THREE.Vector3())
      uniforms.uBoxMin.value.copy(local.min)
      uniforms.uBoxSize.value.copy(s)
      uniforms.uSize.value = Math.max(s.x, s.y, s.z)
    }

    // malzemeler
    let shared = null
    if (OVERRIDE_COLOR) {
      shared = new THREE.MeshPhysicalMaterial({
        color: JELLY_COLOR,
        emissive: JELLY_COLOR,
        emissiveIntensity: JELLY_GLOW,
        roughness: 0.25,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.2,
        side: THREE.DoubleSide,
      })
      patchMaterial(shared, uniforms)
    }
    m.traverse((o) => {
      if (!o.isMesh) return
      o.frustumCulled = false // dalga yüzünden sınır kutusu dışına çıkabilir
      if (shared) {
        o.material = shared
      } else {
        const mats = Array.isArray(o.material) ? o.material : [o.material]
        mats.forEach((mat) => {
          mat.transparent = false
          mat.opacity = 1
          mat.depthWrite = true
          mat.side = THREE.DoubleSide
          if ('transmission' in mat) mat.transmission = 0
          patchMaterial(mat, uniforms)
        })
      }
    })

    // dünyadaki boyuta göre ortala ve ölçekle
    const box = new THREE.Box3().setFromObject(m)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const k = (2.4 / Math.max(size.x, size.y, size.z)) * MODEL_SCALE
    m.scale.setScalar(k)
    m.position.sub(center.multiplyScalar(k))
    return m
  }, [scene, uniforms])

  const { actions } = useAnimations(animations, holder)
  useEffect(() => {
    Object.values(actions).forEach((a) => a && a.reset().play())
  }, [actions])

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime
    // cam küre dağılırken kırpma sınırı açılır, model tam boyuyla görünür
    uniforms.uClip.value = CLIP_RADIUS + smooth(0.55, 0.95, store.value) * 8
  })

  return (
    <group ref={holder} position={MODEL_OFFSET} rotation={MODEL_ROTATION}>
      <primitive object={model} />
    </group>
  )
}

/* Model dosyası yoksa ya da yüklenemezse sayfa çökmesin */
class ModelBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err) {
    console.error(`Model yüklenemedi (${MODEL_URL}):`, err)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/* ---------------- Dışarıya açılan bileşen ---------------- */
export default function Jellyfish() {
  const ref = useRef()

  // denizanası hafifçe yüzer
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    ref.current.position.y = Math.sin(t * 1.2) * 0.08
    ref.current.rotation.y = t * 0.2
    ref.current.rotation.z = Math.sin(t * 0.7) * 0.05
  })

  return (
    <group ref={ref}>
      {MODEL_URL && (
        <ModelBoundary>
          <Suspense fallback={null}>
            <GltfModel url={MODEL_URL} />
          </Suspense>
        </ModelBoundary>
      )}
    </group>
  )
}