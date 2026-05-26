import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function WaveformVisualizer({ isActive, size = 'md' }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const phaseRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const draw = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      if (isActive) {
        phaseRef.current += 0.03

        for (let wave = 0; wave < 3; wave++) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(34, 211, 238, ${0.3 - wave * 0.08})`
          ctx.lineWidth = 2 - wave * 0.5

          for (let x = 0; x < width; x++) {
            const frequency = 0.02 + wave * 0.01
            const amplitude = (height / 4) * (1 - wave * 0.2)
            const y = height / 2 + Math.sin(x * frequency + phaseRef.current + wave) * amplitude * Math.sin(phaseRef.current * 0.5)

            if (x === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
          ctx.stroke()
        }
      } else {
        ctx.beginPath()
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)'
        ctx.lineWidth = 1
        ctx.moveTo(0, height / 2)
        ctx.lineTo(width, height / 2)
        ctx.stroke()
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive])

  const sizeClasses = {
    sm: 'h-8',
    md: 'h-16',
    lg: 'h-24'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`w-full ${sizeClasses[size]}`}
    >
      <canvas
        ref={canvasRef}
        width={400}
        height={size === 'sm' ? 32 : size === 'lg' ? 96 : 64}
        className="w-full h-full"
      />
    </motion.div>
  )
}
