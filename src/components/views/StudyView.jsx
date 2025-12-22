import { Button } from '@/components/ui/button'
import { useFlashcardContext } from '@/context/FlashcardContext'
import { useAudioContext } from '@/context/AudioContext'
import { useTips } from '@/context/TipsContext'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { FlashCard } from '@/components/FlashCard'
import { CategoryFilter } from '@/components/CategoryFilter'
import { KeyboardShortcutsLegend } from '@/components/KeyboardShortcutsLegend'
import { TipCard } from '@/components/TipCard'

/**
 * Study view component - Category filter above card
 */
export const StudyView = () => {
  const {
    currentCard,
    isFlipped,
    setIsFlipped,
    nextCard,
    clearFilters
  } = useFlashcardContext()

  const { playAudio } = useAudioContext()
  const { currentTip, setCurrentTip, getNextTip } = useTips()

  // Handle clicking on tip to show next one (manual advancement)
  const handleTipClick = () => {
    const newTip = getNextTip()
    setCurrentTip(newTip)
  }

  // Keyboard shortcuts for study mode
  useKeyboardShortcuts({
    enabled: true,
    onPlayWord: () => currentCard && playAudio(currentCard.question),
    onPlayExample: () => currentCard?.example && playAudio(currentCard.example),
    onToggleFlip: () => setIsFlipped(prev => !prev),
    onNextCard: nextCard,
    hasExample: !!currentCard?.example
  })

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto">
      {/* Category filter */}
      <div className="w-full mb-6">
        <CategoryFilter />
      </div>

      {/* Main card area */}
      {currentCard ? (
        <>
          <FlashCard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(prev => !prev)}
            onNext={nextCard}
            showNextButton={true}
          />

          {/* Language tip */}
          {currentTip && (
            <div className="w-full mt-6">
              <TipCard tip={currentTip} onNextTip={handleTipClick} />
            </div>
          )}

          {/* Keyboard shortcuts legend */}
          <KeyboardShortcutsLegend />
        </>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No cards available with the selected filters.</p>
          <Button
            onClick={clearFilters}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
