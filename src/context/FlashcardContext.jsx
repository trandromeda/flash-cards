import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import flashcardsData from '@/data/flashcards.json'

const FlashcardContext = createContext(null)

/**
 * Provider component for flashcard state and logic
 */
export const FlashcardProvider = ({ children }) => {
  const [flashcards] = useState(flashcardsData)
  const [currentCard, setCurrentCard] = useState(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [view, setView] = useState('study')
  const [selectedTags, setSelectedTags] = useState([])
  const [viewedCards, setViewedCards] = useLocalStorage('viewedCards', [])

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

  // Initialize with a random card (only on mount)
  useEffect(() => {
    if (flashcards.length === 0) return
    const randomIndex = Math.floor(Math.random() * flashcards.length)
    const card = flashcards[randomIndex]
    setCurrentCard(card)
    // Add initial card to viewed cards
    if (card && !viewedCards.find(c => c.id === card.id)) {
      setViewedCards(prev => [...prev, card])
    }
  }, [])

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
    }, 200)
  }, [getRandomCard, viewedCards, setViewedCards])

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

  const value = {
    flashcards,
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
    clearFilters
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
