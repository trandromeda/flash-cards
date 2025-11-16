import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { BACKGROUND_UPDATE_INTERVAL } from '@/utils/constants'

const TipsContext = createContext(null)

/**
 * Provider component for tips state and logic
 */
export const TipsProvider = ({ children }) => {
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentTip, setCurrentTip] = useState(null)

  // Fetch tips from Supabase on mount
  useEffect(() => {
    async function fetchTips() {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('tips')
          .select('*')
          .order('id', { ascending: true })

        if (fetchError) throw fetchError

        setTips(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching tips:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTips()
  }, [])

  // Get a random tip
  const getRandomTip = useCallback(() => {
    if (tips.length === 0) return null
    const randomIndex = Math.floor(Math.random() * tips.length)
    return tips[randomIndex]
  }, [tips])

  // Get next tip (different from current)
  const getNextTip = useCallback(() => {
    if (tips.length === 0) return null
    if (tips.length === 1) return tips[0]

    let nextTip
    do {
      nextTip = getRandomTip()
    } while (nextTip?.id === currentTip?.id && tips.length > 1)

    return nextTip
  }, [tips, currentTip, getRandomTip])

  // Initialize with a random tip and rotate on interval
  useEffect(() => {
    if (tips.length === 0) return

    // Set initial tip
    if (!currentTip) {
      setCurrentTip(getRandomTip())
    }

    // Rotate tips on the same interval as background images
    const interval = setInterval(() => {
      const nextTip = getNextTip()
      setCurrentTip(nextTip)
    }, BACKGROUND_UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [tips, currentTip, getRandomTip, getNextTip])

  // Add a new tip to Supabase
  const createTip = useCallback(async (tipData) => {
    try {
      const { data, error: insertError } = await supabase
        .from('tips')
        .insert([tipData])
        .select()
        .single()

      if (insertError) throw insertError

      // Update local state
      setTips(prev => [...prev, data])
      return { success: true, data }
    } catch (err) {
      console.error('Error creating tip:', err)
      return { success: false, error: err.message }
    }
  }, [])

  // Update an existing tip
  const updateTip = useCallback(async (id, updates) => {
    try {
      const { data, error: updateError } = await supabase
        .from('tips')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      setTips(prev => prev.map(tip => tip.id === id ? data : tip))

      // Update current tip if it's the one being updated
      if (currentTip?.id === id) {
        setCurrentTip(data)
      }

      return { success: true, data }
    } catch (err) {
      console.error('Error updating tip:', err)
      return { success: false, error: err.message }
    }
  }, [currentTip])

  // Delete a tip
  const deleteTip = useCallback(async (id) => {
    try {
      const { error: deleteError } = await supabase
        .from('tips')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Update local state
      setTips(prev => prev.filter(tip => tip.id !== id))

      // Reset current tip if it's the one being deleted
      if (currentTip?.id === id) {
        setCurrentTip(getRandomTip())
      }

      return { success: true }
    } catch (err) {
      console.error('Error deleting tip:', err)
      return { success: false, error: err.message }
    }
  }, [currentTip, getRandomTip])

  const value = {
    tips,
    loading,
    error,
    currentTip,
    setCurrentTip,
    getRandomTip,
    getNextTip,
    createTip,
    updateTip,
    deleteTip
  }

  return (
    <TipsContext.Provider value={value}>
      {children}
    </TipsContext.Provider>
  )
}

/**
 * Hook to use the tips context
 */
export const useTips = () => {
  const context = useContext(TipsContext)
  if (!context) {
    throw new Error('useTips must be used within a TipsProvider')
  }
  return context
}
