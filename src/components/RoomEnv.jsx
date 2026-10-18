import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

// İnternetten HDRI indirmeden cam yansımaları için hazır "stüdyo odası" ortamı kurar.
export default function RoomEnv() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const envScene = new RoomEnvironment()
    const rt = pmrem.fromScene(envScene, 0.04)
    scene.environment = rt.texture

    return () => {
      scene.environment = null
      rt.dispose()
      pmrem.dispose()
      envScene.dispose?.()
    }
  }, [gl, scene])

  return null
}
