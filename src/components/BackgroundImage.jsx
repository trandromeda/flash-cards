import { motion, AnimatePresence } from 'framer-motion'
import { useBackground } from '@/hooks/useBackground'

/**
 * Background image component with smooth transitions
 * Falls back to gradient when Unsplash API is unavailable
 */
export const BackgroundImage = () => {
  const { backgroundImage, backgroundKey, useFallback } = useBackground()

  return (
    <div className="fixed inset-0" style={{ zIndex: -1 }}>
      <AnimatePresence>
        <motion.div
          key={backgroundKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
          style={
            useFallback || !backgroundImage
              ? {
                  background: 'linear-gradient(135deg, #da251d 0%, #da251d 60%, #ffcd00 100%)',
                }
              : {
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundAttachment: 'fixed'
                }
          }
        />
      </AnimatePresence>
    </div>
  )
}
