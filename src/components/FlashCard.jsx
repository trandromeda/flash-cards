import { Volume2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAudioContext } from '@/context/AudioContext'
import { getTagEmoji } from '@/utils/constants'

/**
 * Individual flash card component
 * @param {Object} props
 * @param {Object} props.card - The card data
 * @param {boolean} props.isFlipped - Whether the card is flipped
 * @param {Function} props.onFlip - Handler for flipping the card
 * @param {Function} props.onNext - Handler for next card (optional, for study mode)
 * @param {boolean} props.showNextButton - Whether to show the next button
 */
export const FlashCard = ({
  card,
  isFlipped = false,
  onFlip,
  onNext,
  showNextButton = false
}) => {
  const { playAudio } = useAudioContext()

  if (!card) return null

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden relative border border-gray-200 dark:border-gray-700">
      <div className="p-4 sm:p-6 md:p-8">
        {/* Vietnamese and English side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6">
          {/* Vietnamese side */}
          <div className="md:border-r border-gray-200 dark:border-gray-700 md:pr-8 pb-4 md:pb-0 border-b md:border-b-0">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Vietnamese</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {card.vietnamese}
            </h2>
            <Button
              onClick={() => playAudio(card.vietnamese)}
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
            className="md:pl-8 pt-4 md:pt-0 cursor-pointer"
            onClick={onFlip}
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">English</p>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold transition-all duration-300 ${
              isFlipped ? 'text-gray-900 dark:text-gray-100' : 'text-transparent bg-gray-200 dark:bg-gray-700 rounded select-none'
            }`}>
              {isFlipped ? card.english : '••••••'}
            </h2>
            {!isFlipped && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">Click to reveal</p>
            )}
          </div>
        </div>

        {/* Example sentence */}
        {card.example && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">Example:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-2">{card.example}</p>
                {isFlipped && card.exampleTranslation && (
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
                className="flex items-center gap-1 shrink-0"
              >
                <Volume2 className="w-4 h-4" />
                Play
              </Button>
            </div>
          </div>
        )}

        {/* Notes */}
        {card.notes && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-700 dark:text-yellow-400 font-semibold mb-2">Notes:</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{card.notes}</p>
          </div>
        )}

        {/* Tags */}
        <div className="mt-6 flex flex-wrap gap-2">
          {card.tags.map(tag => (
            <Badge key={tag} variant="secondary">
              {getTagEmoji(tag)} {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Next card button - shown in study mode */}
      {showNextButton && onNext && (
        <div className="mt-4 md:mt-0 md:absolute md:bottom-4 md:right-4">
          <Button
            onClick={onNext}
            className="flex items-center gap-2 w-full md:w-auto"
          >
            Next Card
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
