import { Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useFlashcardContext } from '@/context/FlashcardContext'
import { useAudioContext } from '@/context/AudioContext'

/**
 * Browse view component - Grid of all cards
 */
export const BrowseView = () => {
  const { filteredCards } = useFlashcardContext()
  const { playAudio } = useAudioContext()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCards.map(card => (
        <div
          key={card.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Vietnamese</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
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
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">English</p>
            <p className="text-lg text-gray-700 dark:text-gray-300">{card.english}</p>
          </div>

          {card.example && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">Example:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-2">{card.example}</p>
                  {card.exampleTranslation && (
                    <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">Translation:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">{card.exampleTranslation}</p>
                    </div>
                  )}
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

          <div className="flex flex-wrap gap-2">
            {card.tags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
