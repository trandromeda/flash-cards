import { useEffect } from 'react'

/**
 * Custom hook for managing keyboard shortcuts
 * @param {Object} config - Configuration object
 * @param {boolean} config.enabled - Whether shortcuts are enabled
 * @param {Function} config.onPlayWord - Handler for playing word audio
 * @param {Function} config.onPlayExample - Handler for playing example audio
 * @param {Function} config.onToggleFlip - Handler for toggling card flip
 * @param {Function} config.onNextCard - Handler for next card
 * @param {boolean} config.hasExample - Whether current card has an example
 */
export const useKeyboardShortcuts = ({
  enabled,
  onPlayWord,
  onPlayExample,
  onToggleFlip,
  onNextCard,
  hasExample
}) => {
  useEffect(() => {
    if (!enabled) return

    const handleKeyPress = (e) => {
      // Prevent shortcuts if user is typing in an input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      switch(e.key) {
        case '1':
          e.preventDefault()
          onPlayWord?.()
          break
        case '2':
          e.preventDefault()
          if (hasExample) {
            onPlayExample?.()
          }
          break
        case ' ':
          e.preventDefault()
          onToggleFlip?.()
          break
        case 'Enter':
          e.preventDefault()
          onNextCard?.()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [enabled, onPlayWord, onPlayExample, onToggleFlip, onNextCard, hasExample])
}
