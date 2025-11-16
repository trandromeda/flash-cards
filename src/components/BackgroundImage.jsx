import { motion, AnimatePresence } from 'framer-motion'
import { useBackground } from '@/hooks/useBackground'

/**
 * Background image component with smooth transitions
 * Falls back to gradient when Unsplash API is unavailable
 */
export const BackgroundImage = () => {
  const { backgroundImage, backgroundKey, useFallback, attribution } = useBackground()

  return (
    <>
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
                    background: '#da251d',
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

      {/* Attribution for Unsplash images */}
      {!useFallback && backgroundImage && attribution && (
        <div className="fixed bottom-4 right-4 z-10">
          <div className="bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg text-xs text-white/90 hover:bg-black/70 transition-colors">
            Photo by{' '}
            <a
              href={attribution.photographerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              {attribution.photographerName}
            </a>
            {' '}on{' '}
            <a
              href={attribution.photoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              Unsplash
            </a>
          </div>
        </div>
      )}
    </>
  )
}
