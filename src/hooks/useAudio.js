import { useState, useCallback } from 'react'
import { base64ToBlob, playWithSpeechSynthesis } from '@/utils/audioUtils'
import { TTS_CONFIG } from '@/utils/constants'

/**
 * Custom hook for managing audio playback with TTS
 * @returns {Object} Audio playback functions and state
 */
export const useAudio = () => {
  const [audioCache, setAudioCache] = useState({})

  const playAudio = useCallback(async (text) => {
    if (!text) return

    try {
      // Check if audio is already cached
      if (audioCache[text]) {
        const audio = new Audio(audioCache[text])
        audio.play()
        return
      }

      const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY

      if (!apiKey) {
        console.warn('Google Cloud API key not found. Using Web Speech API fallback.')
        playWithSpeechSynthesis(text)
        return
      }

      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: { text },
            voice: {
              languageCode: TTS_CONFIG.languageCode,
              name: TTS_CONFIG.voiceName,
              ssmlGender: TTS_CONFIG.ssmlGender
            },
            audioConfig: {
              audioEncoding: TTS_CONFIG.audioEncoding,
              pitch: TTS_CONFIG.pitch,
              speakingRate: TTS_CONFIG.speakingRate
            }
          })
        }
      )

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      const audioContent = data.audioContent

      // Convert base64 to blob URL
      const audioBlob = base64ToBlob(audioContent, 'audio/mp3')
      const audioUrl = URL.createObjectURL(audioBlob)

      // Cache the audio URL
      setAudioCache(prev => ({ ...prev, [text]: audioUrl }))

      // Play the audio
      const audio = new Audio(audioUrl)
      audio.play()
    } catch (error) {
      console.error('Error playing audio:', error)
      // Fallback to Web Speech API
      playWithSpeechSynthesis(text)
    }
  }, [audioCache])

  return { playAudio, audioCache }
}
