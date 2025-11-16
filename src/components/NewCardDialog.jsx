import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FlashcardFormDialog } from '@/components/FlashcardFormDialog'

/**
 * Button that opens dialog for creating a new flashcard
 */
export const NewCardDialog = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">New Card</span>
      </Button>

      <FlashcardFormDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        mode="create"
      />
    </>
  )
}
