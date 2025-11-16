import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { supabase } from '@/lib/supabase'

const FlashcardContext = createContext(null)

/**
 * Provider component for flashcard state and logic
 */
export const FlashcardProvider = ({ children }) => {
  const [flashcards, setFlashcards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentCard, setCurrentCard] = useState(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [view, setView] = useState('study')
  const [selectedTags, setSelectedTags] = useState([])
  const [viewedCards, setViewedCards] = useLocalStorage('viewedCards', [])

  // Fetch flashcards from Supabase on mount
  useEffect(() => {
    async function fetchFlashcards() {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('flashcards')
          .select('*')
          .order('id', { ascending: true })

        if (fetchError) throw fetchError

        // Transform database records to match app format
        const transformedData = data.map(card => ({
          id: card.id,
          vietnamese: card.vietnamese,
          english: card.english,
          example: card.example,
          exampleTranslation: card.example_translation,
          tags: card.tags || [],
          synonymId: card.synonym_id,
          lastSeen: card.last_seen,
          notes: card.notes
        }))

        setFlashcards(transformedData)
        setError(null)
      } catch (err) {
        console.error('Error fetching flashcards:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFlashcards()
  }, [])

  // Get all unique tags
  const allTags = [...new Set(flashcards.flatMap(card => card.tags))].sort()

  // Filter cards based on selected tags
  const filteredCards = selectedTags.length > 0
    ? flashcards.filter(card =>
        selectedTags.some(tag => card.tags.includes(tag))
      )
    : flashcards

  // Get a random card from filtered cards
  const getRandomCard = useCallback(() => {
    if (filteredCards.length === 0) return null
    const randomIndex = Math.floor(Math.random() * filteredCards.length)
    return filteredCards[randomIndex]
  }, [filteredCards])

  // Update last_seen timestamp in Supabase
  const updateLastSeen = useCallback(async (cardId) => {
    try {
      const { error: updateError } = await supabase
        .from('flashcards')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', cardId)

      if (updateError) {
        console.error('Error updating last_seen:', updateError)
      }
    } catch (err) {
      console.error('Error updating last_seen:', err)
    }
  }, [])

  // Initialize with a random card (only after flashcards are loaded)
  useEffect(() => {
    if (flashcards.length === 0 || currentCard) return
    const randomIndex = Math.floor(Math.random() * flashcards.length)
    const card = flashcards[randomIndex]
    setCurrentCard(card)
    // Add initial card to viewed cards
    if (card && !viewedCards.find(c => c.id === card.id)) {
      setViewedCards(prev => [...prev, card])
    }
    // Update last_seen timestamp
    if (card) {
      updateLastSeen(card.id)
    }
  }, [flashcards, currentCard, viewedCards, setViewedCards, updateLastSeen])

  // Next random card
  const nextCard = useCallback(() => {
    setIsFlipped(false)
    setTimeout(() => {
      const card = getRandomCard()
      setCurrentCard(card)
      // Add to viewed cards
      if (card && !viewedCards.find(c => c.id === card.id)) {
        setViewedCards(prev => [...prev, card])
      }
      // Update last_seen timestamp in Supabase
      if (card) {
        updateLastSeen(card.id)
      }
    }, 200)
  }, [getRandomCard, viewedCards, setViewedCards, updateLastSeen])

  // Toggle tag filter
  const toggleTag = useCallback((tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedTags([])
  }, [])

  // Update flashcard
  const updateFlashcard = useCallback(async (id, updates) => {
    try {
      // Transform app format to database format
      const dbUpdates = {
        vietnamese: updates.vietnamese,
        english: updates.english,
        example: updates.example || null,
        example_translation: updates.exampleTranslation || null,
        tags: updates.tags || [],
        notes: updates.notes || null
      }

      const { error: updateError } = await supabase
        .from('flashcards')
        .update(dbUpdates)
        .eq('id', id)

      if (updateError) throw updateError

      // Update local state
      setFlashcards(prev => prev.map(card =>
        card.id === id
          ? { ...card, ...updates }
          : card
      ))

      // Update current card if it's the one being edited
      setCurrentCard(prev =>
        prev && prev.id === id
          ? { ...prev, ...updates }
          : prev
      )

      return { success: true }
    } catch (err) {
      console.error('Error updating flashcard:', err)
      return { success: false, error: err.message }
    }
  }, [])

  // Delete flashcard
  const deleteFlashcard = useCallback(async (id) => {
    try {
      const { error: deleteError } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Update local state
      setFlashcards(prev => prev.filter(card => card.id !== id))

      // If deleting the current card, select a new one
      if (currentCard && currentCard.id === id) {
        const newCard = getRandomCard()
        setCurrentCard(newCard)
      }

      // Remove from viewed cards
      setViewedCards(prev => prev.filter(card => card.id !== id))

      return { success: true }
    } catch (err) {
      console.error('Error deleting flashcard:', err)
      return { success: false, error: err.message }
    }
  }, [currentCard, getRandomCard, setViewedCards])

  // Create new flashcard
  const createFlashcard = useCallback(async (cardData) => {
    try {
      // Transform app format to database format
      const dbCard = {
        vietnamese: cardData.vietnamese,
        english: cardData.english,
        example: cardData.example || null,
        example_translation: cardData.exampleTranslation || null,
        tags: cardData.tags || [],
        notes: cardData.notes || null
      }

      const { data, error: insertError } = await supabase
        .from('flashcards')
        .insert(dbCard)
        .select()

      if (insertError) throw insertError

      // Transform database format back to app format
      const newCard = {
        id: data[0].id,
        vietnamese: data[0].vietnamese,
        english: data[0].english,
        example: data[0].example,
        exampleTranslation: data[0].example_translation,
        tags: data[0].tags || [],
        synonymId: data[0].synonym_id,
        lastSeen: data[0].last_seen,
        notes: data[0].notes
      }

      // Add to local state
      setFlashcards(prev => [...prev, newCard])

      return { success: true, card: newCard }
    } catch (err) {
      console.error('Error creating flashcard:', err)
      return { success: false, error: err.message }
    }
  }, [])

  const value = {
    flashcards,
    loading,
    error,
    currentCard,
    isFlipped,
    setIsFlipped,
    view,
    setView,
    selectedTags,
    setSelectedTags,
    allTags,
    filteredCards,
    viewedCards,
    nextCard,
    toggleTag,
    clearFilters,
    updateLastSeen,
    updateFlashcard,
    deleteFlashcard,
    createFlashcard
  }

  return (
    <FlashcardContext.Provider value={value}>
      {children}
    </FlashcardContext.Provider>
  )
}

/**
 * Hook to access flashcard context
 * @returns {Object} Flashcard context value
 */
export const useFlashcardContext = () => {
  const context = useContext(FlashcardContext)
  if (!context) {
    throw new Error('useFlashcardContext must be used within FlashcardProvider')
  }
  return context
}
