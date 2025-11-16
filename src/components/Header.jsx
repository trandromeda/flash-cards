import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { NewCardDialog } from '@/components/NewCardDialog'
import { useFlashcardContext } from '@/context/FlashcardContext'

/**
 * Application header with view switcher, new card button, and theme toggle
 */
export const Header = () => {
  const { view, setView } = useFlashcardContext()

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Vietnamese Flash Cards
          </h1>
          <div className="flex gap-2 items-center">
            <Button
              onClick={() => setView('study')}
              variant={view === 'study' ? 'default' : 'outline'}
              size="sm"
            >
              Study
            </Button>
            <Button
              onClick={() => setView('browse')}
              variant={view === 'browse' ? 'default' : 'outline'}
              size="sm"
            >
              Browse All
            </Button>
            <NewCardDialog />
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
