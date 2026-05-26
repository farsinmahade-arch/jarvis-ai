import { useEffect, useRef } from 'react'

export default function WaveformVisualizer({ active }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    const bars = 24
    const barWidth = 3
    const gap = 2
    canvas.width = bars * (barWidth + gap)
    canvas.height = 30

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < bars; i++) {
        const height = active
          ? Math.random() * 20 + 4
          : 2 + Math.sin(Date.now() * 0.002 + i * 0.5) * 1.5
        const x = i * (barWidth + gap)
        const y = (canvas.height - height) / 2

        ctx.fillStyle = active
          ? `rgba(34, 211, 238, ${0.5 + Math.random() * 0.5})`
          : 'rgba(34, 211, 238, 0.15)'
        ctx.fillRect(x, y, barWidth, height)
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [active])

  return <canvas ref={canvasRef} className="h-[30px] opacity-80" />
}
