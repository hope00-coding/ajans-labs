import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { TILE_COUNT, SPHERE_R, TILE_TILT, GLASS_THICK, DISPERSION } from '../config'
import { store } from '../store'

// çoğu net cam, bazıları hafif gri/mor camsı
const PALETTE = [0xffffff, 0xffffff, 0xffffff, 0xeef1ff, 0xd6d4e6, 0xbfbdd3]
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

const smooth = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

export default function GlassSphere() {
  const groupRef = useRef()
  const meshRef = useRef()

  const geometry = useMemo(() => new RoundedBoxGeometry(0.44, 0.44, 0.1, 4, 0.035), [])

  // Her panelin küredeki yeri, dağılacağı yer, dönüşü ve yok olma eşiği
  const tiles = useMemo(() => {
    const dummy = new THREE.Object3D()
    const jitterE = new THREE.Euler()
    const jitterQ = new THREE.Quaternion()
    const list = []

    for (let i = 0; i < TILE_COUNT; i++) {
      // Fibonacci küresi: paneller eşit aralıkla dağılır
      const y = 1 - ((i + 0.5) / TILE_COUNT) * 2
      const r = Math.sqrt(1 - y * y)
      const phi = i * GOLDEN
      const dir = new THREE.Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r)

      const start = dir.clone().multiplyScalar(SPHERE_R)
      dummy.position.copy(start)
      dummy.scale.set(1, 1, 1)
      dummy.lookAt(0, 0, 0)

      // her panele küçük rastgele eğim: arkadaki yazı her panelde farklı kayar
      jitterE.set(
        (Math.random() - 0.5) * 2 * TILE_TILT,
        (Math.random() - 0.5) * 2 * TILE_TILT,
        (Math.random() - 0.5) * 2 * TILE_TILT
      )
      jitterQ.setFromEuler(jitterE)
      const q = dummy.quaternion.clone().multiply(jitterQ)

      const scatter = start
        .clone()
        .add(dir.clone().multiplyScalar(2 + Math.random() * 5))
        .add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3
          )
        )

      list.push({
        start,
        scatter,
        q,
        spin: new THREE.Vector3(
          (Math.random() - 0.5) * 9,
          (Math.random() - 0.5) * 9,
          (Math.random() - 0.5) * 9
        ),
        thr: 0.7 + Math.random() * 0.25, // yok olma eşiği
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      })
    }
    return list
  }, [])

  // renk tonları
  useLayoutEffect(() => {
    const c = new THREE.Color()
    tiles.forEach((t, i) => {
      c.setHex(t.color)
      meshRef.current.setColorAt(i, c)
    })
    meshRef.current.instanceColor.needsUpdate = true
  }, [tiles])

  // karede kullanılacak geçici nesneler
  const tmp = useMemo(
    () => ({
      dummy: new THREE.Object3D(),
      q: new THREE.Quaternion(),
      e: new THREE.Euler(),
      p: new THREE.Vector3(),
    }),
    []
  )

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const mesh = meshRef.current
    if (!mesh) return

    // kaydırma ilerlemesini yumuşat
    store.value += (store.target - store.value) * (1 - Math.exp(-6 * dt))
    const prog = store.value

    // paneller: küre konumu -> dağılmış konum
    const e = 1 - Math.pow(1 - prog, 3)
    const { dummy, q, e: euler, p } = tmp
    for (let i = 0; i < tiles.length; i++) {
      const d = tiles[i]
      p.lerpVectors(d.start, d.scatter, e)
      euler.set(d.spin.x * e, d.spin.y * e, d.spin.z * e)
      q.setFromEuler(euler)
      dummy.quaternion.copy(d.q).multiply(q)
      dummy.position.copy(p)
      dummy.scale.setScalar(Math.max(1 - smooth(d.thr, 1, prog), 0.0001))
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true

    // küre fare ve zamanla hafif döner
    const t = performance.now() / 1000
    groupRef.current.rotation.y = t * 0.15 + store.mouse.x * 0.35
    groupRef.current.rotation.x = store.mouse.y * 0.2
  })

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[geometry, undefined, TILE_COUNT]} frustumCulled={false}>
        {/* gerçek cam: arkadaki her şey kırılarak görünür */}
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0}
          roughness={0.06}
          transmission={1}
          thickness={GLASS_THICK}
          ior={1.5}
          dispersion={DISPERSION}
          clearcoat={1}
          clearcoatRoughness={0.05}
          specularIntensity={1}
          envMapIntensity={1.7}
          attenuationColor="#e4e8ff"
          attenuationDistance={8}
        />
      </instancedMesh>
    </group>
  )
}
