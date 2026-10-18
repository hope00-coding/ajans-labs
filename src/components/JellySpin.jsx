import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { store } from '../store'
import {
  SECTIONS,
  SPIN_TURNS,
  SPIN_DIR,
  FINALE_GROW,
  FINALE_Z,
  FINALE_TOP_MARGIN,
  MODEL_SCALE,
  MODEL_OFFSET,
} from '../config'

// Modelin yarı boyu: en uzun kenar 2.4 * MODEL_SCALE (Jellyfish.jsx ile aynı), tepesi ortadan bu kadar yukarıda
const HALF_H = (2.4 * MODEL_SCALE) / 2

// Denizanasını başlık geçişleriyle döndürür. Finalde büyütür, yaklaştırır ve tepesi ekran dışına çıkmasın diye aşağı indirir.
export default function JellySpin({ children }) {
  const ref = useRef()

  useFrame((state) => {
    const g = ref.current
    if (!g) return
    g.rotation.y = store.page * Math.PI * 2 * SPIN_TURNS * SPIN_DIR

    // Finalin ilk adımı (son başlıktan sonraki durak): 0..1
    const f = Math.min(Math.max(store.page - (SECTIONS.length - 1), 0), 1)
    const e = f * f * (3 - 2 * f)

    // Dar/dikey ekranda büyüme azalır, denizanası taşmasın
    const aspect = state.size.width / state.size.height
    const k = Math.min(1, Math.max(0.4, aspect / 1.3))
    const scale = 1 + FINALE_GROW * k * e
    const z = FINALE_Z * k * e
    g.scale.setScalar(scale)
    g.position.z = z

    // Tepesi, ekranın üstünden FINALE_TOP_MARGIN kadar boşluk bırakacak yerde dursun
    const cam = state.camera
    const halfVis = (cam.position.z - z) * Math.tan((cam.fov * Math.PI) / 360) // tepenin derinliğinde görünen yarım yükseklik
    const allowedTop = halfVis * (1 - FINALE_TOP_MARGIN)
    const top = (HALF_H + MODEL_OFFSET[1]) * scale
    g.position.y = Math.min(0, allowedTop - top) * e
  })

  return <group ref={ref}>{children}</group>
}