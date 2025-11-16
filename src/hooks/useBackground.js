import { useState, useEffect } from 'react'
import { BACKGROUND_UPDATE_INTERVAL } from '@/utils/constants'

/**
 * Custom hook for managing dynamic background images from Unsplash
 * @returns {Object} Background image URL, animation key, and fallback status
 */
export const useBackground = () => {
  const [backgroundImage, setBackgroundImage] = useState('')
  const [backgroundKey, setBackgroundKey] = useState(0)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    const updateBackground = async () => {
      try {
        const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY

        // Build the API URL - works with or without access key
        // Without key: uses demo mode (50 requests/hour)
        // With key: uses production mode (5000 requests/hour)
        const apiUrl = new URL('https://api.unsplash.com/photos/random')
        apiUrl.searchParams.append('query', 'vietnam')
        apiUrl.searchParams.append('orientation', 'landscape')

        if (accessKey) {
          apiUrl.searchParams.append('client_id', accessKey)
        }

        const response = await fetch(apiUrl.toString())

        if (!response.ok) {
          throw new Error(`Unsplash API error: ${response.status}`)
        }

        const data = await response.json()

        if (data.urls && data.urls.regular) {
          const newImageUrl = data.urls.regular

          // Preload the image
          const img = new Image()
          img.src = newImageUrl
          img.onload = () => {
            // Update background image and key for AnimatePresence
            setBackgroundImage(newImageUrl)
            setBackgroundKey(prev => prev + 1)
            setUseFallback(false)
          }
        }
      } catch (error) {
        console.warn('Error fetching background from Unsplash:', error.message)
        // Use gradient fallback
        setUseFallback(true)
        setBackgroundKey(prev => prev + 1)
      }
    }

    // Set initial background
    updateBackground()

    // Update background every two minutes
    const interval = setInterval(updateBackground, BACKGROUND_UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  return { backgroundImage, backgroundKey, useFallback }
}
