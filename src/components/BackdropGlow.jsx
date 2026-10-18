import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { store } from '../store'

const Z = -15 // arka plan yansımasının derinliği (her şeyin arkasında)

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Yavaşça hareket eden 3 renkli leke. Ekran oranına göre yuvarlak kalır.
const FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uAspect;
  uniform float uGlow;
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uC;
  varying vec2 vUv;

  float blob(vec2 p, vec2 c, float r) {
    vec2 d = (p - c) * vec2(uAspect, 1.0);
    return exp(-dot(d, d) / (r * r));
  }

  void main() {
    float t = uTime * 0.15;
    float b1 = blob(vUv, vec2(0.2 + 0.12 * sin(t * 1.3), 0.75 + 0.1 * cos(t * 1.1)), 0.55);
    float b2 = blob(vUv, vec2(0.85 + 0.1 * cos(t * 0.9), 0.25 + 0.12 * sin(t * 1.7)), 0.5);
    float b3 = blob(vUv, vec2(0.5 + 0.2 * sin(t * 0.7), 0.5 + 0.2 * cos(t * 0.8)), 0.45);
    float w = b1 + b2 + b3;
    vec3 col = (uA * b1 + uB * b2 + uC * b3) / max(w, 0.001);
    gl_FragColor = vec4(col, clamp(w * uGlow, 0.0, 0.85));
    #include <colorspace_fragment>
  }
`

export default function BackdropGlow() {
  const camera = useThree((s) => s.camera)
  const viewport = useThree((s) => s.viewport)
  const size = useThree((s) => s.size)
  const meshRef = useRef()

  const { width: W, height: H } = useMemo(
    () => viewport.getCurrentViewport(camera, [0, 0, Z], size),
    [viewport, camera, size]
  )

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uAspect: { value: 1 },
          uGlow: { value: 0 },
          uA: { value: new THREE.Color() },
          uB: { value: new THREE.Color() },
          uC: { value: new THREE.Color() },
        },
      }),
    []
  )

  useFrame((state) => {
    const [r, g, b] = store.tint
    const u = material.uniforms
    u.uTime.value = state.clock.elapsedTime
    u.uAspect.value = W / H
    u.uGlow.value = store.glow
    // Üç leke aynı rengin birbirine yakın tonları olsun (uyumlu dursun)
    u.uA.value.setRGB(r, g, b)
    u.uB.value.setRGB(r * 0.5 + g * 0.5, g * 0.5 + b * 0.5, b * 0.5 + r * 0.5)
    u.uC.value.setRGB(r * 0.5 + b * 0.5, g * 0.5 + r * 0.5, b * 0.5 + g * 0.5)
    if (meshRef.current) meshRef.current.visible = store.glow > 0.01
  })

  return (
    <mesh ref={meshRef} position={[0, 0, Z]} scale={[W * 1.02, H * 1.02, 1]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}