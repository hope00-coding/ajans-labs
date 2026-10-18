import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Backdrop from './Backdrop'
import BackdropGlow from './BackdropGlow'
import Headings from './Headings'
import RoomEnv from './RoomEnv'
import CameraRig from './CameraRig'
import GlassSphere from './GlassSphere'
import Jellyfish from './Jellyfish'
import JellySpin from './JellySpin'
import JellyLight from './JellyLight'
import Rings from './Rings'
import Bubbles from './Bubbles'
import { store } from '../store'
import { BUBBLES_PAGE } from '../config'

// Toplar sayfasına gelirken denizanası küçülüp kaybolur
function JellyFade({ children }) {
  const ref = useRef()
  useFrame(() => {
    const t = Math.min(Math.max((store.page - (BUBBLES_PAGE - 0.6)) / 0.5, 0), 1)
    const s = 1 - t * t * (3 - 2 * t)
    ref.current.visible = s > 0.01
    ref.current.scale.setScalar(Math.max(s, 0.0001))
  })
  return <group ref={ref}>{children}</group>
}

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 35, near: 0.1, far: 100, position: [0, 0, 7] }}
      gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
    >
      <CameraRig />
      <RoomEnv />
      <Backdrop />
      <JellyLight />
      <BackdropGlow />
      <Headings />
      <JellyFade>
        <JellySpin>
          <Jellyfish />
        </JellySpin>
      </JellyFade>
      <Rings />
      <Bubbles />
      <GlassSphere />
    </Canvas>
  )
}