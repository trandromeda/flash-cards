import { useState, useEffect } from 'react'
import { Volume2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import flashcardsData from './data/flashcards.json'

function App() {
  const [flashcards, setFlashcards] = useState(flashcardsData)
  const [currentCard, setCurrentCard] = useState(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [view, setView] = useState('study') // 'study' or 'browse'
  const [selectedTags, setSelectedTags] = useState([])
  const [audioCache, setAudioCache] = useState({}) // Cache for audio URLs
  const [viewedCards, setViewedCards] = useState(() => {
    // Initialize from localStorage or empty array
    const saved = localStorage.getItem('viewedCards')
    return saved ? JSON.parse(saved) : []
  })
  const [backgroundImage, setBackgroundImage] = useState('')

  // Get all unique tags
  const allTags = [...new Set(flashcards.flatMap(card => card.tags))].sort()

  // Emoji mapping for categories
  const tagEmojis = {
    'basics': '📚',
    'greetings': '👋',
    'family': '👨‍👩‍👧‍👦',
    'food': '🍜',
    'work': '💼',
    'questions': '❓',
    'shopping': '🛒',
    'restaurant': '🍽️',
    'cooking': '👨‍🍳',
    'hobbies': '🎨',
    'health': '🏥',
    'travel': '✈️',
    'directions': '🗺️',
    'time': '⏰',
    'weather': '🌤️',
    'numbers': '🔢',
    'colors': '🎨',
    'animals': '🐾',
    'body': '🧍',
    'clothing': '👔',
    'emotions': '😊',
    'home': '🏠',
    'transportation': '🚗',
    'education': '🎓',
    'sports': '⚽',
    'nature': '🌳',
    'technology': '💻',
    'default': '🏷️'
  }

  const getTagEmoji = (tag) => {
    const lowerTag = tag.toLowerCase()
    return tagEmojis[lowerTag] || tagEmojis['default']
  }

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
    const card = getRandomCard()
    setCurrentCard(card)
    // Add initial card to viewed cards
    if (card && !viewedCards.find(c => c.id === card.id)) {
      const updatedViewed = [...viewedCards, card]
      setViewedCards(updatedViewed)
      localStorage.setItem('viewedCards', JSON.stringify(updatedViewed))
    }
  }, [filteredCards])

  // Save viewed cards to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('viewedCards', JSON.stringify(viewedCards))
  }, [viewedCards])

  // Fetch and update background image from Unsplash every minute
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
          setBackgroundImage(data.urls.regular)
        }
      } catch (error) {
        console.error('Error fetching background from Unsplash:', error)
        // Keep current background or use gradient fallback
        if (!backgroundImage) {
          console.log('Using gradient fallback')
        }
      }
    }

    // Set initial background
    updateBackground()

    // Update background every minute (60000ms)
    const interval = setInterval(updateBackground, 60000)

    return () => clearInterval(interval)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only enable shortcuts in study mode
      if (view !== 'study' || !currentCard) return

      // Prevent shortcuts if user is typing in an input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      switch(e.key) {
        case '1':
          e.preventDefault()
          playAudio(currentCard.vietnamese)
          break
        case '2':
          e.preventDefault()
          if (currentCard.example) {
            playAudio(currentCard.example)
          }
          break
        case ' ':
          e.preventDefault()
          setIsFlipped(!isFlipped)
          break
        case 'Enter':
          e.preventDefault()
          nextCard()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [view, currentCard, isFlipped])

  // Next random card
  const nextCard = () => {
    setIsFlipped(false)
    setTimeout(() => {
      const card = getRandomCard()
      setCurrentCard(card)
      // Add to viewed cards
      if (card && !viewedCards.find(c => c.id === card.id)) {
        setViewedCards(prev => [...prev, card])
      }
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
    <div
      className={`min-h-screen bg-cover bg-center bg-fixed transition-all duration-1000 ${
        !backgroundImage ? 'bg-gradient-to-br from-blue-50 to-indigo-100' : ''
      }`}
      style={{
        backgroundImage: backgroundImage
          ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${backgroundImage})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Vietnamese Flash Cards</h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setView('study')}
                variant={view === 'study' ? 'default' : 'outline'}
              >
                Study
              </Button>
              <Button
                onClick={() => setView('browse')}
                variant={view === 'browse' ? 'default' : 'outline'}
              >
                Browse All
              </Button>
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
              <Button
                onClick={clearFilters}
                variant="ghost"
                size="sm"
              >
                Clear filters
              </Button>
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
                <span className="mr-1">{getTagEmoji(tag)}</span>
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
          // Study View - Single Card with Stack
          <div className="flex gap-6">
            {/* Card Stack - Left Side */}
            {viewedCards.length > 0 && (
              <div className="w-64 shrink-0">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Session Progress ({viewedCards.length})
                </h3>
                <div className={`space-y-2 ${viewedCards.length > 10 ? 'max-h-[600px] overflow-y-auto pr-2' : ''}`}>
                  {viewedCards.map((card, index) => (
                    <div
                      key={`${card.id}-${index}`}
                      className="group relative bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      {/* Collapsed state */}
                      <div className="group-hover:hidden">
                        <p className="text-xs text-gray-500 mb-1">Card {index + 1}</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {card.vietnamese}
                        </p>
                      </div>
                      {/* Expanded state on hover */}
                      <div className="hidden group-hover:block">
                        <p className="text-xs text-gray-500 mb-1">Vietnamese</p>
                        <p className="text-sm font-semibold text-gray-900 mb-2">
                          {card.vietnamese}
                        </p>
                        <p className="text-xs text-gray-500 mb-1">English</p>
                        <p className="text-sm text-gray-700">
                          {card.english}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Card Area */}
            <div className="flex-1 flex flex-col items-center">
            {currentCard ? (
              <>
                <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden relative">
                  {/* Main card content */}
                  <div className="p-8">
                    {/* Vietnamese and English side by side */}
                    <div className="grid grid-cols-2 gap-8 mb-6">
                      {/* Vietnamese side */}
                      <div className="border-r border-gray-200 pr-8">
                        <p className="text-sm text-gray-500 mb-2">Vietnamese</p>
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                          {currentCard.vietnamese}
                        </h2>
                        <Button
                          onClick={() => playAudio(currentCard.vietnamese)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Volume2 className="w-4 h-4" />
                          Play Word
                        </Button>
                      </div>

                      {/* English side - revealed on click */}
                      <div
                        className="pl-8 cursor-pointer"
                        onClick={() => setIsFlipped(!isFlipped)}
                      >
                        <p className="text-sm text-gray-500 mb-2">English</p>
                        <h2 className={`text-4xl font-bold transition-all duration-300 ${
                          isFlipped ? 'text-gray-900' : 'text-transparent bg-gray-200 rounded select-none'
                        }`}>
                          {isFlipped ? currentCard.english : '••••••'}
                        </h2>
                        {!isFlipped && (
                          <p className="text-sm text-gray-500 mt-2 italic">Click to reveal</p>
                        )}
                      </div>
                    </div>

                    {/* Example sentence */}
                    {currentCard.example && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-xs text-blue-600 font-semibold mb-1">Example:</p>
                            <p className="text-sm text-gray-700 italic">{currentCard.example}</p>
                          </div>
                          <Button
                            onClick={() => playAudio(currentCard.example)}
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 shrink-0"
                          >
                            <Volume2 className="w-4 h-4" />
                            Play
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="mt-6 flex flex-wrap gap-1">
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

                  {/* Next card button - bottom right */}
                  <div className="absolute bottom-4 right-4">
                    <Button
                      onClick={nextCard}
                      className="flex items-center gap-2"
                    >
                      Next Card
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Keyboard shortcuts legend */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-600 mb-2">Keyboard Shortcuts:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">1</kbd>
                      <span className="text-gray-600">Play word</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">2</kbd>
                      <span className="text-gray-600">Play example</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">Space</kbd>
                      <span className="text-gray-600">Reveal translation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">Enter</kbd>
                      <span className="text-gray-600">Next card</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-gray-600">No cards available with the selected filters.</p>
                <Button
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            )}
            </div>
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
                  <Button
                    onClick={() => playAudio(card.vietnamese)}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 p-0 h-auto"
                  >
                    <Volume2 className="w-4 h-4" />
                    Play
                  </Button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">English</p>
                  <p className="text-lg text-gray-700">{card.english}</p>
                </div>

                {card.example && (
                  <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-xs text-blue-600 font-semibold mb-1">Example:</p>
                        <p className="text-sm text-gray-700 italic">{card.example}</p>
                      </div>
                      <Button
                        onClick={() => playAudio(card.example)}
                        variant="ghost"
                        size="sm"
                        className="shrink-0 h-auto p-1"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>
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
