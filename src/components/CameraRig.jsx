import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

// Dar (mobil) ekranlarda kamerayı geri çeker ki küre kesilmesin.
export default function CameraRig() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)

  useEffect(() => {
    const aspect = size.width / size.height
    camera.position.z = aspect < 1 ? 7 / (aspect * 1.25) : 7
    camera.updateProjectionMatrix()
  }, [camera, size])

  return null
}
