import { Button } from '@/components/ui/button'
import { MultiSelect } from '@/components/ui/multi-select'
import { useFlashcardContext } from '@/context/FlashcardContext'
import { getTagEmoji } from '@/utils/constants'

/**
 * Compact category filter component for sidebar
 */
export const CategoryFilter = () => {
  const {
    allTags,
    selectedTags,
    filteredCards,
    flashcards,
    setSelectedTags,
    clearFilters
  } = useFlashcardContext()

  // Convert tags to options format
  const tagOptions = allTags.map(tag => ({
    value: tag,
    label: tag
  }))

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter by tags</h3>
        {selectedTags.length > 0 && (
          <Button
            onClick={clearFilters}
            variant="ghost"
            size="sm"
          >
            Clear
          </Button>
        )}
      </div>

      <MultiSelect
        options={tagOptions}
        selected={selectedTags}
        onChange={setSelectedTags}
        placeholder="Search tags..."
        getEmoji={getTagEmoji}
      />

      {selectedTags.length > 0 && (
        <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
          {filteredCards.length} of {flashcards.length} cards
        </p>
      )}
    </div>
  )
}
