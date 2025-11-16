import { useState, useEffect } from 'react'
import flashcardsData from './data/flashcards.json'

function App() {
  const [flashcards, setFlashcards] = useState(flashcardsData)
  const [currentCard, setCurrentCard] = useState(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [view, setView] = useState('study') // 'study' or 'browse'
  const [selectedTags, setSelectedTags] = useState([])
  const [audioCache, setAudioCache] = useState({}) // Cache for audio URLs

  // Get all unique tags
  const allTags = [...new Set(flashcards.flatMap(card => card.tags))].sort()

  // Filter cards based on selected tags
  const filteredCards = selectedTags.length > 0
    ? flashcards.filter(card =>
        selectedTags.some(tag => card.tags.includes(tag))
      )
    : flashcards

  // Get a random card
  const getRandomCard = () => {
    if (filteredCards.length === 0) return null
    const randomIndex = Math.floor(Math.random() * filteredCards.length)
    return filteredCards[randomIndex]
  }

  // Initialize with a random card
  useEffect(() => {
    setCurrentCard(getRandomCard())
  }, [filteredCards])

  // Next random card
  const nextCard = () => {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentCard(getRandomCard())
    }, 200)
  }

  // Play audio using Google Cloud Text-to-Speech API
  const playAudio = async (text) => {
    try {
      // Check if audio is already cached
      if (audioCache[text]) {
        const audio = new Audio(audioCache[text])
        audio.play()
        return
      }

      const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY

      if (!apiKey) {
        console.error('Google Cloud API key not found. Please add VITE_GOOGLE_CLOUD_API_KEY to your .env file')
        // Fallback to Web Speech API
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'vi-VN'
        speechSynthesis.speak(utterance)
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
              languageCode: 'vi-VN',
              name: 'vi-VN-Wavenet-A', // High quality Vietnamese female voice
              ssmlGender: 'FEMALE'
            },
            audioConfig: {
              audioEncoding: 'MP3',
              pitch: 0,
              speakingRate: 0.9 // Slightly slower for learning
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
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'vi-VN'
      speechSynthesis.speak(utterance)
    }
  }

  // Helper function to convert base64 to blob
  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
  }

  // Toggle tag filter
  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedTags([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Vietnamese Flash Cards</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setView('study')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'study'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Study
              </button>
              <button
                onClick={() => setView('browse')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'browse'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Browse All
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tag Filters */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Filter by category:</h3>
            {selectedTags.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Clear filters
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              Showing {filteredCards.length} of {flashcards.length} cards
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {view === 'study' ? (
          // Study View - Single Card
          <div className="flex flex-col items-center">
            {currentCard ? (
              <>
                <div
                  className={`w-full max-w-md bg-white rounded-2xl shadow-xl p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl ${
                    isFlipped ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{ minHeight: '300px' }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-center mb-6">
                      <p className="text-sm text-gray-500 mb-2">
                        {isFlipped ? 'English' : 'Vietnamese'}
                      </p>
                      <h2 className="text-4xl font-bold text-gray-900">
                        {isFlipped ? currentCard.english : currentCard.vietnamese}
                      </h2>
                    </div>

                    {!isFlipped && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          playAudio(currentCard.vietnamese)
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 3a1 1 0 011 1v12a1 1 0 01-1.707.707l-4-4H3a1 1 0 01-1-1V8a1 1 0 011-1h2.293l4-4A1 1 0 0110 3zm8.536 4.464a1 1 0 010 1.414 5 5 0 010 7.071 1 1 0 11-1.414-1.414 3 3 0 000-4.243 1 1 0 010-1.414z"/>
                        </svg>
                        Play Audio
                      </button>
                    )}

                    {currentCard.example && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-600 font-semibold mb-1">Example:</p>
                        <p className="text-sm text-gray-700 italic">{currentCard.example}</p>
                      </div>
                    )}

                    <div className="mt-6 flex flex-wrap gap-1 justify-center">
                      {currentCard.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-sm text-gray-600">
                  Click card to {isFlipped ? 'hide' : 'reveal'} translation
                </p>

                <button
                  onClick={nextCard}
                  className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Next Card
                </button>
              </>
            ) : (
              <div className="text-center">
                <p className="text-gray-600">No cards available with the selected filters.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          // Browse View - All Cards
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map(card => (
              <div
                key={card.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Vietnamese</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {card.vietnamese}
                  </h3>
                  <button
                    onClick={() => playAudio(card.vietnamese)}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3a1 1 0 011 1v12a1 1 0 01-1.707.707l-4-4H3a1 1 0 01-1-1V8a1 1 0 011-1h2.293l4-4A1 1 0 0110 3zm8.536 4.464a1 1 0 010 1.414 5 5 0 010 7.071 1 1 0 11-1.414-1.414 3 3 0 000-4.243 1 1 0 010-1.414z"/>
                    </svg>
                    Play
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">English</p>
                  <p className="text-lg text-gray-700">{card.english}</p>
                </div>

                {card.example && (
                  <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-blue-600 font-semibold mb-1">Example:</p>
                    <p className="text-sm text-gray-700 italic">{card.example}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  {card.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
