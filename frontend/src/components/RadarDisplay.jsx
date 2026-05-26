import { motion } from 'framer-motion'

export default function RadarDisplay({ size = 120, active = true }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border border-jarvis-cyan/20" />

      {/* Middle ring */}
      <div className="absolute inset-3 rounded-full border border-jarvis-cyan/15" />

      {/* Inner ring */}
      <div className="absolute inset-6 rounded-full border border-jarvis-cyan/10" />

      {/* Cross hairs */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-jarvis-cyan/10" />
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-jarvis-cyan/10" />

      {/* Sweep */}
      {active && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          className="absolute inset-0"
          style={{ transformOrigin: 'center center' }}
        >
          <div
            className="absolute top-1/2 left-1/2 w-1/2 h-px"
            style={{
              background: 'linear-gradient(90deg, rgba(34, 211, 238, 0.5), transparent)',
              transformOrigin: 'left center',
            }}
          />
        </motion.div>
      )}

      {/* Center dot */}
      <motion.div
        animate={active ? { scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute top-1/2 left-1/2 w-2 h-2 -mt-1 -ml-1 rounded-full bg-jarvis-cyan"
      />

      {/* Random blips */}
      {active && [
        { top: '30%', left: '65%' },
        { top: '60%', left: '35%' },
        { top: '45%', left: '70%' },
      ].map((pos, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 3, delay: i * 1.2 }}
          className="absolute w-1 h-1 rounded-full bg-jarvis-cyan"
          style={pos}
        />
      ))}
    </div>
  )
}
