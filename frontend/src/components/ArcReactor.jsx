import { motion } from 'framer-motion'

export default function ArcReactor({ size = 160, className = '' }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      {/* Ring 3 - outermost */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-jarvis-cyan/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ boxShadow: '0 0 15px rgba(34,211,238,0.2)' }}
      >
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <div
            key={deg}
            className="absolute w-2 h-2 bg-jarvis-cyan/50 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${deg}deg) translateY(-${size / 2 - 4}px) translate(-50%, -50%)`,
            }}
          />
        ))}
      </motion.div>

      {/* Ring 2 */}
      <motion.div
        className="absolute rounded-full border border-jarvis-cyan/50"
        style={{
          inset: size * 0.12,
          boxShadow: '0 0 10px rgba(34,211,238,0.3)',
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 90, 180, 270].map((deg) => (
          <div
            key={deg}
            className="absolute w-3 h-0.5 bg-jarvis-cyan/60"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${deg}deg) translateX(${size * 0.3}px) translate(-50%, -50%)`,
            }}
          />
        ))}
      </motion.div>

      {/* Ring 1 - inner */}
      <motion.div
        className="absolute rounded-full border border-jarvis-cyan/40"
        style={{ inset: size * 0.25 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      {/* Core */}
      <motion.div
        className="absolute rounded-full bg-jarvis-cyan/80"
        style={{
          inset: size * 0.38,
          boxShadow: '0 0 30px rgba(34,211,238,0.6), 0 0 60px rgba(34,211,238,0.3)',
        }}
        animate={{
          boxShadow: [
            '0 0 30px rgba(34,211,238,0.6), 0 0 60px rgba(34,211,238,0.3)',
            '0 0 50px rgba(34,211,238,0.8), 0 0 80px rgba(34,211,238,0.5)',
            '0 0 30px rgba(34,211,238,0.6), 0 0 60px rgba(34,211,238,0.3)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  )
}
