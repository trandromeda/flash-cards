import { Kbd } from "@/components/ui/kbd"

/**
 * Keyboard shortcuts legend component
 */
export const KeyboardShortcutsLegend = () => {
  return (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Keyboard Shortcuts:</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Kbd>1</Kbd>
          <span className="text-gray-600 dark:text-gray-400">Play word</span>
        </div>
        <div className="flex items-center gap-2">
          <Kbd>2</Kbd>
          <span className="text-gray-600 dark:text-gray-400">Play example</span>
        </div>
        <div className="flex items-center gap-2">
          <Kbd>Space</Kbd>
          <span className="text-gray-600 dark:text-gray-400">Reveal translation</span>
        </div>
        <div className="flex items-center gap-2">
          <Kbd>Enter</Kbd>
          <span className="text-gray-600 dark:text-gray-400">Next card</span>
        </div>
      </div>
    </div>
  )
}
