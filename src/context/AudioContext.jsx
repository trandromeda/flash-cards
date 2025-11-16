import { createContext, useContext } from 'react'
import { useAudio } from '@/hooks/useAudio'

const AudioContext = createContext(null)

/**
 * Provider component for audio functionality
 */
export const AudioProvider = ({ children }) => {
  const audio = useAudio()

  return (
    <AudioContext.Provider value={audio}>
      {children}
    </AudioContext.Provider>
  )
}

/**
 * Hook to access audio context
 * @returns {Object} Audio context value
 */
export const useAudioContext = () => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudioContext must be used within AudioProvider')
  }
  return context
}
