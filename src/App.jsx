import { FlashcardProvider, useFlashcardContext } from '@/context/FlashcardContext'
import { AudioProvider } from '@/context/AudioContext'
import { ThemeProvider } from '@/components/theme-provider'
import { BackgroundImage } from '@/components/BackgroundImage'
import { Header } from '@/components/Header'
import { StudyView } from '@/components/views/StudyView'
import { BrowseView } from '@/components/views/BrowseView'

/**
 * Main app content - wrapped by providers
 */
const AppContent = () => {
  const { view, loading, error } = useFlashcardContext()

  if (loading) {
    return (
      <div className="min-h-screen relative text-foreground flex items-center justify-center">
        <BackgroundImage />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-foreground/80">Loading flashcards...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen relative text-foreground flex items-center justify-center">
        <BackgroundImage />
        <div className="relative z-10 text-center max-w-md mx-auto px-4">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
            <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Flashcards</h2>
            <p className="text-foreground/80 mb-4">{error}</p>
            <p className="text-sm text-foreground/60">
              Make sure you have run the database migration. See SUPABASE_SETUP.md for instructions.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative text-foreground">
      {/* Background image with smooth transitions */}
      <BackgroundImage />

      {/* Main content */}
      <div className="relative min-h-screen">
        <Header />

        {/* Main content area */}
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {view === 'study' ? <StudyView /> : <BrowseView />}
        </div>
      </div>
    </div>
  )
}

/**
 * Root App component with providers
 */
function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vietnamese-flash-cards-theme">
      <AudioProvider>
        <FlashcardProvider>
          <AppContent />
        </FlashcardProvider>
      </AudioProvider>
    </ThemeProvider>
  )
}

export default App
