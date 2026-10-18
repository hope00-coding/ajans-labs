import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { BG_BASE, BG_BLOBS, BG_DOT_SIZE, BG_DOT_ALPHA } from '../config'

// Arka plan (gradyan + renkli lekeler + noktalı doku) 2D canvas'a çizilip sahnenin arka planı yapılır.
export default function Backdrop() {
  const scene = useThree((s) => s.scene)
  const size = useThree((s) => s.size)
  const dpr = useThree((s) => s.viewport.dpr)

  const { canvas, ctx, texture } = useMemo(() => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return { canvas, ctx, texture }
  }, [])

  useEffect(() => {
    scene.background = texture

    const draw = () => {
      const w = (canvas.width = Math.min(Math.round(size.width * dpr), 4096))
      const h = (canvas.height = Math.min(Math.round(size.height * dpr), 4096))
      const k = w / size.width // css px -> canvas px
      const big = Math.max(w, h)

      // ana gradyan
      const g = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, big * 0.7)
      g.addColorStop(0, BG_BASE[0])
      g.addColorStop(0.55, BG_BASE[1])
      g.addColorStop(1, BG_BASE[2])
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      // renkli yumuşak lekeler
      BG_BLOBS.forEach((b) => {
        const cx = b.x * w
        const cy = b.y * h
        const r = b.r * big
        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        bg.addColorStop(0, `rgba(${b.rgb[0]},${b.rgb[1]},${b.rgb[2]},${b.a})`)
        bg.addColorStop(1, `rgba(${b.rgb[0]},${b.rgb[1]},${b.rgb[2]},0)`)
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, w, h)
      })

      // noktalı (halftone) doku
      const s = Math.max(Math.round(BG_DOT_SIZE * k), 2)
      const p = document.createElement('canvas')
      p.width = p.height = s
      const pc = p.getContext('2d')
      pc.fillStyle = 'rgba(255,255,255,.9)'
      pc.beginPath()
      pc.arc(s / 2, s / 2, Math.max(k * 0.9, 0.8), 0, Math.PI * 2)
      pc.fill()
      ctx.globalAlpha = BG_DOT_ALPHA
      ctx.fillStyle = ctx.createPattern(p, 'repeat')
      ctx.fillRect(0, 0, w, h)
      ctx.globalAlpha = 1

      // boyut değişince doku yeniden oluşturulmalı
      texture.dispose()
      texture.needsUpdate = true
    }

    draw()

    return () => {
      scene.background = null
    }
  }, [scene, size.width, size.height, dpr, canvas, ctx, texture])

  useEffect(() => () => texture.dispose(), [texture])

  return null
}