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
  const { view } = useFlashcardContext()

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
